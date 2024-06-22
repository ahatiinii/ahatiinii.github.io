#!/usr/bin/perl

#
# Generate JSON database from plaintext files with pseudo-markdown definitions.
#
# Input should be the name of a file that lists every requested database entry
# and the name of a file to write the database to. Verbs should be listed in the
# 1SG.IPFV. Roots should be listed in all capitals.
#
# Output is a JSON file.
#
# Program fails on error.
#


use strict;
use warnings;
use utf8;
use File::Basename;
use Encode;
use JSON;

binmode STDOUT, ":encoding(UTF-8)";
binmode STDERR, ":encoding(UTF-8)";

my $dirname = dirname __FILE__;
my $dict_dir = "$dirname/dict";
my $paradigm_dir = "$dirname/paradigms";

my %root_cache;
my %conj_cache;


#### Helper functions ####

#
# Get index of [2]-th line of [0] matching [1].
#
sub match_index {
    my ($lines, $re, $num) = @_;

    if (not $num) {
        $num = 1;
    }

    for my $i (0 .. scalar @$lines - 1) {
        if (@$lines[$i] =~ $re) {
            $num -= 1;
        }

        if ($num == 0) {
            return $i;
        }
    }

    return -1;
}


#
# Get match from [2]-th line of [0] matching [1].
#
sub match_value {
    my ($lines, $re, $num) = @_;

    my @matches = ();

    if ($num) {
        $num -= 1;
    }
    else {
        $num = 0;
    }

    for (@$lines) {
        if ($_ =~ $re) {
            push @matches, $1;
        }
    }

    if (not @matches) {
        return '';
    }

    return $matches[$num];
}


#
# Get block from [0] starting after the line matching [1], after index [2].
#
sub match_block {
    my ($lines, $start_re, $start_i) = @_;

    my $length = scalar @$lines;
    my $si = -1;
    my $ei = $length;
    my @block;

    if (not $start_i) {
        $start_i = 0;
    }

    for my $i ($start_i .. $length - 1) {
        if (@$lines[$i] =~ $start_re) {
            $si = $i;
            last;
        }
    }

    if ($si == -1) {
        return ();
    }

    for my $i ($si + 1 .. $length - 1) {
        if (@$lines[$i] =~ /^$/) {
            $ei = $i;
            last;
        }
    }

    if ($ei - $si < 2) {
        return ();
    }

    @block = @$lines[$si + 1 .. $ei - 1];

    return \@block;
}


#### Functions for extracting information from plain text files ####

#
# Get word from [0].
#
sub get_word {
    my $lines = $_[0];

    return @$lines[0];
}


#
# Get word type from [0]: verb, root, or prefix.
#
sub get_word_type {
    my $lines = $_[0];

    return @$lines[1];
}


#
# Get root from [0] (verbs only).
#
sub get_verb_root {

    return match_value $_[0], qr/^Root: (.*)/;
}


#
# Get classifier from [0] (verbs only).
#
sub get_verb_classifier {
    return match_value $_[0], qr/^Classifier: (.*)/;
}


#
# Get list of prefixes from [0] (verbs only).
#
sub get_verb_prefixes {
    return match_value $_[0], qr/^Prefixes: (.*)/;
}


#
# Get aspect from [0] (verbs only).
#
sub get_verb_aspect {
    return match_value $_[0], qr/^Aspect: (.*)/;
}


#
# Get verb type from [0] (verbs only).
#
sub get_verb_type {
    return match_value $_[0], qr/^Type: (.*)/;
}


#
# Get definition from [0] (verbs only).
#
sub get_verb_def {
    return match_block $_[0], qr/^Definition:$/;
}


#
# Get conjugation information from [0] (verbs only).
#
sub get_verb_conj {
    return match_block $_[0], qr/^Conjugation:$/;
}


#
# Get conjugation table from [0] (only verbs that don't reference a conjugation
#   file).
#
sub get_verb_conj_table {
    return match_block $_[0], qr/^Conjugation table:$/;
}


#
# Get definition of [1]-th root from [0] (roots only).
#
sub get_root_def {
    my ($lines, $num) = @_;

    my $index;

    if (not $num) {
        $num = 1;
    }

    $index = match_index $lines, qr/^$num$/;

    return match_block $lines, qr/^Definition:$/, $index;
}


#
# Get 2D hash of stems of [1]-th root from [0] by mode and aspect (roots only).
#
sub get_root_stems {
    my ($lines, $num) = @_;

    my $index;
    my $block;
    my @modes;
    my %stems;

    if (not $num) {
        $num = 1;
    }

    $index = match_index $lines, qr/^$num$/;
    $block = match_block $lines, qr/^Stems:$/, $index;

    @modes = split / /, @$block[0];

    for my $i (1 .. scalar @$block - 1) {
        my @words = split / /, @$block[$i];
        my $aspect = shift @words;

        if (scalar @words != scalar @modes) {
            return ();
        }

        for my $j (0 .. scalar @modes - 1) {
            $stems{$modes[$j]}{$aspect} = $words[$j];
        }
    }

    return \%stems;
}


#
# Get hash of derived verbs of [1]-th root from [0] by aspect (roots only).
#
sub get_root_verbs {
    my ($lines, $num) = @_;

    my $index;
    my $block;
    my %verbs;

    if (not $num) {
        $num = 1;
    }

    $index = match_index $lines, qr/^$num$/;
    $block = match_block $lines, qr/^Verbs:$/, $index;

    for (@$block) {
        my $aspect;
        my @words;

        if ($_ =~ /^(.*): (.*)$/) {
            $aspect = $1;
            @words = split / /, $2;

            $verbs{$aspect} = \@words;
        }
    }

    return \%verbs;
}


#### Functions for processing files ####

#
# Read text file into array.
#
sub read_file {
    local $/;

    my $file_path = $_[0];

    # read in file
    open IFH, '<', "$file_path"  or die $! . " ($file_path)";
    my @lines = split /\n/, (Encode::decode 'utf8', <IFH>);
    close(IFH);

    # quick check: make sure file isn't empty
    if (not scalar @lines) {
        die "Malformed file ($file_path)";
    }

    return [@lines];
}


sub generate_verb_conj_table;


#
# Process verb file for input [0].
#
sub process_verb {
    my $filepath = "$dict_dir/$_[0].txt";
    my $lines = read_file $filepath;

    my %hash;

    $hash{'word'} = get_word $lines;
    $hash{'type'} = get_word_type $lines;
    $hash{'root'} = get_verb_root $lines;
    $hash{'classifier'} = get_verb_classifier $lines;
    $hash{'prefixes'} = get_verb_prefixes $lines;
    $hash{'aspect'} = get_verb_aspect $lines;
    $hash{'transtype'} = get_verb_type $lines;
    $hash{'definition'} = get_verb_def $lines;
    $hash{'paradigm'} = get_verb_conj $lines;
    $hash{'conjugations'} = get_verb_conj_table $lines;

    if ($hash{'type'} ne "Verb" || !$hash{'root'} || !$hash{'classifier'} ||
        !$hash{'aspect'} || !$hash{'transtype'} || !$hash{'definition'} ||
        !$hash{'paradigm'}) {
        die "Malformed file ($filepath)";
    }

    if (not $hash{'conjugations'}) {
        $hash{'conjugations'} = generate_verb_conj_table \%hash;
    }

    return \%hash;
}


#
# Process root file for input [0], root number [1].
#
sub process_root {
    my $root = $_[0];
    my $num = $_[1];
    my $filepath = "$dict_dir/$root.txt";
    my $lines;
    my %hash;

    # TODO: make this work with multiple roots of the same form
    if ($root_cache{$root}) {
        return $root_cache{$root};
    }

    $lines = read_file $filepath;

    $hash{'word'} = get_word $lines;
    $hash{'type'} = get_word_type $lines;
    $hash{'definition'} = get_root_def $lines, $num;
    $hash{'stems'} = get_root_stems $lines, $num;
    $hash{'verbs'} = get_root_verbs $lines, $num;

    if ($hash{'type'} ne "Root" || !$hash{'definition'} || !$hash{'stems'} ||
        !$hash{'verbs'}) {
        die "Malformed file ($filepath)";
    }

    $root_cache{$root} = \%hash;

    return \%hash;
}


#
# Process root file for input [0].
#
sub process_all_roots {
    # TODO: pages with more than 1 identical root
    return process_root $_[0], 1;
}


#
# Process prefix file.
#
sub process_prefix {
    # my $filepath = "$dict_dir/$_[0].txt";
    # my $lines = read_file $filepath;
    # my $word = get_word $lines;
    # my $word_type = get_word_type $lines;
}


#
# Process conjugation file.
#
# TODO: can this be merged with verb stem processing as a single function?
sub process_conj {
    my $conj_name = $_[0];
    my $conj_class;
    my $conj_subclass;
    my $filepath;
    my $block;
    my @modes;
    my %conj;

    if ($conj_cache{$conj_name}) {
        return $conj_cache{$conj_name};
    }

    # TODO: make this work for more than one conjugation class
    if (@$conj_name[0] =~ /^(.*) \((.*)\)$/) {
        $conj_class = $1;
        $conj_subclass = $2;

        $conj_class =~ s/\//_/g;
        $conj_class =~ s/∅/null/g;
    }

    $filepath = "$paradigm_dir/$conj_class/$conj_subclass.txt";
    $block = read_file $filepath;
    splice @$block, -2;

    @modes = split / /, @$block[0];

    for my $i (1 .. scalar @$block - 1) {
        my @words = split / /, @$block[$i];
        my $person_number = shift @words;

        if (scalar @words != scalar @modes) {
            die "Malformed file ($filepath)";
        }

        for my $j (0 .. scalar @modes - 1) {
            $conj{$modes[$j]}{$person_number} = $words[$j];
        }
    }

    $conj_cache{$conj_name} = \%conj;

    return \%conj;
}


#
# Apply d-effect to initial consonant of stem [0]
#
sub apply_d_effect {
    my $stem = $_[0];
    my $icons;

    if ($stem =~ /^zh/) {
        $icons = 'zh';
    }
    else {
        $icons = substr $stem, 0, 1;
    }

    # TODO: distinguish y = gh (-> g) from y (-> 'y) in text files, change spelling here
    # TODO: double classifiers
    if ($icons eq 'm' || $icons eq 'n' || $icons eq 'w') {
        $stem = 'ʼ' . $stem;
    }
    elsif ($icons eq 'y') {
        $stem = 'g' . substr $stem, 1;
    }
    elsif ($icons eq 'l') {
        $stem = 'd' . $stem;
    }
    elsif ($icons eq 'z') {
        $stem = 'd' . $stem;
    }
    elsif ($icons eq 'zh') {
        $stem = 'j' . substr $stem, 2;
    }
    elsif ($icons eq 'ʼ') {
        $stem = 't' . $stem;
    }

    return $stem;
}


#
# Apply devoicing to initial consonant of stem [0]
#
sub apply_devoice {
    my $stem = $_[0];
    my $icons;
    my $rest;

    if ($stem =~ /^(gh|zh)(.*)$/) {
        $icons = $1;
        $rest = $2;
    }
    else {
        $icons = substr $stem, 0, 1;
        $rest = substr $stem, 1;
    }

    # TODO: distinguish y = gh from y, y -> s vs y -> h (AnDic 824)
    if ($icons eq 'gh' || $icons eq 'y' || $icons eq 'w') {
        $stem = 'h' . $rest;
    }
    elsif ($icons eq 'l') {
        $stem = 'ł' . $rest;
    }
    elsif ($icons eq 'z') {
        $stem = 's' . $rest;
    }
    elsif ($icons eq 'zh') {
        $stem = 'sh' . $rest;
    }

    return $stem;
}


# Combine prefix [0], classifier [1], and stem [2] with all morphological
#   alterations.
#
sub combine_parts {
    my ($prefix, $classifier, $stem) = @_;
    my $d_effect;
    my $pfcons;

    if  ($classifier eq '∅-') {
        $classifier = '';
    }
    else {
        $classifier = substr $classifier, 0, -1;
    }

    if ($prefix =~ /^(.*)d$/) {
        $prefix = $1;
        $d_effect = 1;
    }

    # TODO: gh allowed here?
    if ($prefix =~ /((s|z|g)h)$/) {
        $pfcons = $1;
    }
    else {
        $pfcons = substr $prefix, -1;
    }

    if ($classifier eq '') {
        # 1DPL -> stem d-effect
        if ($d_effect) {
            $stem = apply_d_effect $stem;
        }
        # Prefix -> stem devoicing
        elsif ($pfcons eq 's' || $pfcons eq 'sh' || $pfcons eq 'h' ||
            $pfcons eq 'ł') {
            $stem = apply_devoice $stem;
        }
    }
    elsif ($classifier eq 'ł') {
        # 1DPL -> classifier d-effect
        if ($d_effect) {
            $classifier = 'l';
        }
        else {
            # Ł-classifier deletion
            if ($stem =~ /^(z|l|gh)/ || $prefix =~ /(s|sh)$/) {
                $classifier = '';
            }

            # 2DPL/2PL h deletion before ł-classifier
            if ($prefix =~ /^(.*)h$/) {
                $prefix = $1;
            }

            # Ł-classifier -> stem devoicing
            $stem = apply_devoice $stem;
        }
    }
    elsif ($classifier eq 'd') {
        # D-classifier -> stem d-effect
        $classifier = '';
        $stem = apply_d_effect $stem;
    }
    elsif ($classifier eq 'l') {
        # L-classifier deletion
        if ($prefix =~ /(s|sh)$/) {
            $classifier = '';
        }

        # 2DPL/2PL contraction
        if ($prefix =~ /^(.*)h$/) {
            $prefix = $1;
            $classifier = 'ł';
        }
    }

    # sibilant harmony
    if ((index $stem, 'sh') != -1 || (index $stem, 'zh') != -1) {
        $prefix =~ s/(s|z)([^h]|$)/$1h$2/g;
    }
    elsif ((index $stem, 's') != -1 || (index $stem, 'z') != -1) {
        $prefix =~ s/(s|z)h/$1/g;
    }

    return $prefix . $classifier . $stem;
}


#
# Generate verb conjugation table for verb [0] (verbs only).
#
sub generate_verb_conj_table {
    my $verb_hash = $_[0];

    my $root_hash;
    my %verb_table;
    my $conj_table;
    my $lines;
    my $num;
    my $root;

    # Get root number (for more than one of the same form), "ROOT#" -> "ROOT", #
    if ($verb_hash->{'root'} =~ /^(.*)([0..9])$/) {
        $root = $1;
        $num = $2;
    }
    else {
        $root = $verb_hash->{'root'};
        $num = 1;
    }

    # Process verb root
    $root_hash = process_root $root, $num;

    # Process verb conjugation
    $conj_table = process_conj $verb_hash->{'paradigm'};

    for my $mode ('IMP', 'ITER', 'USIT', 'PERF', 'PROG', 'FUT', 'OPT') {
        my $s_mode = $mode;
        my $p_mode = $mode;

        if ($mode eq 'PERF') {
            if ($verb_hash->{'classifier'} eq '∅-' || $verb_hash->{'classifier'} eq 'ł-') {
                $p_mode = 'PERF-∅/ł';
            }
            else {
                $p_mode = 'PERF-d/l';
            }
        }

        if ($mode eq 'ITER' || $mode eq 'USIT') {
            $s_mode = 'ITER/USIT';
        }

        if (!$conj_table->{$p_mode} || !$root_hash->{'stems'}->{$s_mode}) {
            next;
        }

        for my $pernum ('1-SG', '2-SG', '3-SG', '3o-SG', '3a-SG', '3i-SG', '3s-SG',
            '1-DPL', '2-DPL', '1-PL', '2-PL', '3-PL', '3o-PL', '3a-PL', '3i-PL',
            '3s-PL', 'PASS-A', 'PASS-B', 'REV', 'SEMELIT') {
            if (!$conj_table->{$p_mode}{$pernum}) {
                $verb_table{$mode}{$pernum} = '-';
            }
            else {
                $verb_table{$mode}{$pernum} = combine_parts
                    $conj_table->{$p_mode}{$pernum}, $verb_hash->{'classifier'},
                    $root_hash->{'stems'}->{$s_mode}{$verb_hash->{'aspect'}};
            }
        }
    }

    return \%verb_table;
}


#### Main ####

my $in_path = $ARGV[0];
my $out_path = $ARGV[1];
my $block;
my %dict_hash;
my $json;

if (!$in_path || !$out_path) {
    die "No input given";
}

$block = read_file $in_path;

for my $word (@$block) {
    if ($dict_hash{'word'}) {
        print "Duplicate word ($word), skipping...\n";
        next;
    }

    # Root
    if ($word eq uc $word) {
        $dict_hash{$word} = process_all_roots $word;
    }
    # Prefix
    elsif ($word =~ /-$/) {
        $dict_hash{$word} = process_prefix $word;
    }
    # Verb
    else {
        $dict_hash{$word} = process_verb $word;
    }
}

# TODO: is there a better way to do this?
my @temp = values %dict_hash;
$json = JSON::to_json { 'dictionary' => \@temp };

open OFH, '>', "$out_path" or die $! . " ($out_path)";
binmode OFH, ":encoding(UTF-8)";
print OFH $json;
close(OFH);
