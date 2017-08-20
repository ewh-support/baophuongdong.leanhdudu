$(function() {
    $.fn.limit = function($n) {
        this.each(function() {
            var allText = $(this).html();
            var tLength = $(this).html().length;
            var startText = allText.slice(0, $n);
            if (tLength >= $n) {
                $(this).html(startText + '...');
            } else {
                $(this).html(startText);
            };
        });

        return this;
    }
    $('.excerpt p').limit(160);
});
$(function() {
    $.fn.limit = function($n) {
        this.each(function() {
            var allText = $(this).html();
            var tLength = $(this).html().length;
            var startText = allText.slice(0, $n);
            if (tLength >= $n) {
                $(this).html(startText + '...');
            } else {
                $(this).html(startText);
            };
        });

        return this;
    }
    $('.excerpt .small').limit(95);
});