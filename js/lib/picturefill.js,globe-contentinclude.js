// throttled resize event from jQuery Mobile
(function( $ ) {
	$.event.special.throttledresize = {
		setup: function() {
			$( this ).bind( "resize", handler );
		},
		teardown: function(){
			$( this ).unbind( "resize", handler );
		}
	};
	var throttle = 250,
		handler = function() {
			curr = ( new Date() ).getTime();
			diff = curr - lastCall;

			if ( diff >= throttle ) {

				lastCall = curr;
				$( this ).trigger( "throttledresize" );

			} else {

				if ( heldCall ) {
					clearTimeout( heldCall );
				}

				// Promise a held call will still execute
				heldCall = setTimeout( handler, throttle - diff );
			}
		},
		lastCall = 0,
		heldCall,
		curr,
		diff;
})( jQuery );

/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {

var $event = $.event,
	$special,
	resizeTimeout;

$special = $event.special.debouncedresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments,
			dispatch = function() {
				// set correct event type
				event.type = "debouncedresize";
				$event.dispatch.apply( context, args );
			};

		if ( resizeTimeout ) {
			clearTimeout( resizeTimeout );
		}

		execAsap ?
			dispatch() :
			resizeTimeout = setTimeout( dispatch, $special.threshold );
	},
	threshold: 150
};

})(jQuery);

/**
* Mat Marquis' Carousel
* http://matmarquis.com/carousel/
*/
(function($){
	$.fn.carousel = function(config) {
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			prevSlide: '.prev',
			nextSlide: '.next',
			counter: '.counter',
			counterText: 'Slide {current} of {total}',
			secondary: '.secondary',
			speed: 500
		},
		$wrapper = $(this),
		opt = $.extend(defaults, config);

		carousel = {
			roundDown : function(leftmargin) {
				var leftmargin = parseInt(leftmargin, 10);

				return Math.ceil( (leftmargin - (leftmargin % 100 ) ) / 100) * 100;
			},
			transitionSupport : function() {
				var dStyle = document.body.style;

				return dStyle.webkitTransition !== undefined || 
						dStyle.mozTransition !== undefined ||
						dStyle.msTransition !== undefined ||
						dStyle.oTransition !== undefined ||
						dStyle.transition !== undefined;
			},
			currentPage : function($slider, leftmargin) {
				var current = -(leftmargin / 100),
					$slides = $slider.find(".slide"),
					$primaryslides = $slider.not('[id*=secondary]').find(".slide"),
					$pagination = $slider.parent().find('.carousel-tabs'),
					label = opt.counterText;

				$slides.removeClass("sl-active");
				$($slides[current]).addClass("sl-active");
				if($pagination) {

					var $container = $slider.parent(),
						$counterHeading = $container.find(opt.counter);

					if ($counterHeading) {
						var label = opt.counterText;
						label = label.replace("{current}", (current + 1));
						label = label.replace("{total}", $primaryslides.length);
						$counterHeading.text(label);
					}

					$pagination.find('li:nth-child(' + (current + 1 ) + ')')
						.addClass('current')
						.siblings()
							.removeClass('current');
				}
			},
			/* Adjustment to work around browser rounding errors */
			tweak : function($slider) {
				$slider.each(function() {
					var $slider = $(this),
						$container = $slider.parent(),
						$current = $slider.find(".sl-active");
				
					$current.each(function() {
						var $slide = $(this),
							diff = $container.width() - $slide.width(),
							$slides = $slider.find(".slide"),
							iMax = $slides.length;

						if (diff != 0) {
							for (var i = 0; i < iMax; i++) {
								$($slides[i]).css("left", (diff * i) + "px");
							}
						} else {
							$slides.css("left", 0);
						}
					});
				});
			},
			move : function($slider, moveTo) {
				if( !$slider ) {
					return;
				}
				if( carousel.transitionSupport() ) {
					$slider.css('marginLeft', moveTo + "%");
				} else {
					$slider.animate({ marginLeft: moveTo + "%" }, opt.speed);
				}
				carousel.currentPage($slider, moveTo);
				carousel.tweak($slider);
			}
		};
		
		var nextPrev = function($slider, dir, $secondary) {
			var leftmargin = ( $slider.attr('style') ) ? $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
				$primaryslider = $slider.not('[id*="secondary"]'),
				$slide = $primaryslider.find(opt.slide),
				constrain = dir === 'prev' ? leftmargin != 0 : -leftmargin < ($slide.length - 1) * 100,
				$target = $( '[href*="#' + $primaryslider.attr('id') + '"]');

			if (!$slider.is(":animated") && constrain ) {

				if ( dir === 'prev' ) {
					leftmargin = ( leftmargin % 100 != 0 ) ? carousel.roundDown(leftmargin) : leftmargin + 100;
				} else {
					leftmargin = ( ( leftmargin % 100 ) != 0 ) ? carousel.roundDown(leftmargin) - 100 : leftmargin - 100;
				}

				carousel.move($slider, leftmargin);
				carousel.move($secondary, leftmargin);

				$target.removeClass('disabled');

				switch( leftmargin ) {
					case ( -($slide.length - 1) * 100 ):
						$target.filter(opt.nextSlide).addClass('disabled');
						break;
					case 0:
						$target.filter(opt.prevSlide).addClass('disabled');
						break;
				}
			} else {
				var reset = carousel.roundDown(leftmargin);

				carousel.move($slider, reset);
				if( $secondary !== null ) {
					carousel.move($secondary, reset);
				}
			}
		},
		nextPrevSetup = function(e) {
			var $el = $(e.target).closest(opt.prevSlide + ',' + opt.nextSlide),
				link = this.hash,
				dir = ( $el.is(opt.prevSlide) ) ? 'prev' : 'next',
				$slider = $( opt.slider ).filter(link),
				$secondary = ($(opt.slider).filter(link + '-secondary').length) ? $(opt.slider).filter(link + '-secondary') : null;

				if ( $el.is('.disabled') ) { 
					return false;
				}

				nextPrev($slider, dir, $secondary);

			e.preventDefault();	
		};

		$wrapper.parent().find(opt.nextSlide + ',' + opt.prevSlide)
			.bind('click', nextPrevSetup);

		$(opt.prevSlide).addClass('disabled');


		$('.carousel-tabs').find('a').click(function(e) {
			var $el = $(this),
				current = parseInt(this.hash.match(/\-slide(.*[0-9])/i) && RegExp.$1, 10),
				move = (100 * (current - 1)),
				$contain = $el.closest('.slidewrap'),
				$prev = $contain.find(opt.prevSlide),
				$next = $contain.find(opt.nextSlide),
				$target = $contain.find(opt.slider);

			$el.parent()
				.addClass('current')
				.siblings()
					.removeClass('current');

			carousel.move($target, -move);

			if(move == 0) {
				$prev.addClass('disabled');
			} else {
				$prev.removeClass('disabled');
			}

			if($el.parent().is(':last-child')) {
				$next.addClass('disabled');
			} else {
				$next.removeClass('disabled');
			}

			e.preventDefault();
		});

		//swipes trigger move left/right
		$wrapper.parent().bind( "dragSnap", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';

			nextPrev($slider, dir);
		});

		return this.each(function() {
			var $wrap = $(this),
				secId;

			if(opt.secondary) {
				var $target = $wrap.find(opt.secondary);

				if($target.length > 1) {
					var secId = $wrap.find('.slider').attr('id') + '-secondary',
						$secWrap = $('<div class="secslidewrap" />'),
						$secSlider = $('<div class="secslider" />'),
						$secList = $('<ul class="slider" id="' + secId + '" />');
					$wrap.prepend($secWrap.append($secSlider.append($secList)));

					$target.each(function() {
						$('<li class="slide" />')
							.append($(this))
							.appendTo($secList);
					});
				}
			}

			var $slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$slider.css({
				width: 100 * slidenum + "%"
			});

			$slide.css({
				width: (100 / slidenum) + "%"
			});

			carousel.currentPage($slider, 0);
			
			carousel.tweak( (secId ) ? $slider.not('#' + secId) : $slider);
			$wrapper.show();

		});
	};
})(jQuery);


/**
 * --------------------------------------------------------------------
 * jQuery collapsible plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * note: modified to exclude jquery animations, title tip the cue text, and also to find parent node's sibling if no sibling
 * --------------------------------------------------------------------
 */
$.fn.collapsible = function(options){
	return $(this).each(function(){
		var o = $.extend({
			splitBtn: false,
			event: 'click', //also accepts hover, hoverintent
			content: null
		},options);

		//define
		var collapsibleHeading = $(this),
		//if no sibling content, try parent's sibling
			collapsibleContent = o.content || ( collapsibleHeading.next().length ? collapsibleHeading.next() : collapsibleHeading.parent().next() ),
			extraAriaText = collapsibleHeading.attr("data-enhanced-aria-label"),
			expandCueText = ' (Content collapsed: click to expand contents) ',
			collapseCueText = ' (Content expanded: click to collapse contents)';		
			
		//modify markup & attributes
		collapsibleHeading
			.addClass('collapsible-heading')
			.append('<span class="collapsible-heading-status"></span>')
			.not('a')
				.wrapInner('<a href="#" class="collapsible-heading-toggle"></a>').end()
			.filter('a')
				.addClass('collapsible-heading-toggle');

		collapsibleContent.addClass('collapsible-content');
		

		//events
		collapsibleHeading
			.bind('collapse', function(){
				
				$(this)
					.addClass('collapsible-heading-collapsed')
					.removeClass('collapsible-heading-expanded')
					.find('.collapsible-heading-toggle')
						.attr('title',expandCueText)
						.find('.collapsible-heading-status')
						//.text( expandCueText );
				collapsibleContent
					.addClass('collapsible-content-collapsed')
					.removeClass('collapsible-expand-complete')
					.attr('aria-hidden',true);
				collapsibleContent.parent().addClass('collapsible-collapsed').removeClass('collapsible-expanded');
			
			
				
				return this;
			})
			.bind('expand', function(){
				var $el = $(this);

				$el
					.removeClass('collapsible-heading-collapsed')
					.addClass('collapsible-heading-expanded')
					.find('.collapsible-heading-toggle')
						.attr('title',collapseCueText)
						.find('.collapsible-heading-status')
						//.text( collapseCueText);
				collapsibleContent
					.removeClass('collapsible-content-collapsed')
					.attr('aria-hidden',false);
				collapsibleContent.parent()
					.addClass('collapsible-expanded')
					.removeClass('collapsible-collapsed')
					.attr("aria-label", "Content expanded");
					
				
				return this;
			})
			.bind('toggleCollapsible',function(event){
				var $el = $(this);
				if( o.splitBtn && $(event.target).is('a') ){
					return;
				}
				if( $el.is('.collapsible-heading-collapsed') ){
					if( $('.collapsible-heading-expanded').length ) {
						$('.collapsible-heading-expanded').trigger('collapse');
						$el.trigger('expand');
					} else {
						$el.trigger('expand');
					}
				}
				else { $el.trigger('collapse');  }
				return this;
			})
			.trigger('collapse');

		collapsibleHeading.bind(globe.e.click,function(){
			$(this).trigger('toggleCollapsible');
			return false;
		});
	});
};




(function($){
	$.fn.stickyScroll = function() {
		if( !$(this).length ) { return; }
			
		var $win = $(window),
			$quicknav = $(this),
			insetTop = $quicknav.offset().top,
			mastHeight = $('#masthead').height(),
			containerTop = insetTop + $quicknav.outerHeight(true) - $quicknav.height(),
			initScroll = (( $(document).scrollTop() == 0 ) ? $('html') : $(document)).scrollTop(),
			stickyScroll = function() {
				if( window.innerWidth < 800 ) { return; }
				
				var scroll = (( $(document).scrollTop() == 0 ) ? $('html') : $(document)).scrollTop();

				//console.log('scroll: '+scroll);
				//console.log('containerTop: '+containerTop);

				if( ( scroll + $quicknav.height() ) < $('#main').height() + mastHeight ) {
					if( scroll > containerTop ) {
						$quicknav
							.removeClass('quicknav-docked')
							.addClass('quicknav-scrolling')
							.stop()
							.animate({"top": ( scroll - mastHeight ) + "px" }, 200 );
					} else {
						$quicknav
							.removeClass('quicknav-scrolling')
							.addClass('quicknav-docked');
					}
				} else {
					$quicknav.css('top', ( $('#main').height() - $quicknav.height() ) + 'px');
				}
			};

		$win.bind('scroll', function() {
				stickyScroll();
			}).bind('throttledresize', function() {
				stickyScroll();
			});
			
		$(document).ready(function() {
			$quicknav.parent().addClass('has-quicknav');
			
				// TODO remove this hack with a real solution for the containerTop math
				if(globe.section === "todays-paper"){
					containerTop += 200;
				}
			
			stickyScroll();	
		});
		
	};
})(jQuery);

/*
 * jQuery special events for delayedEnter, delayedLeave, and delayedHover
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * note: Each event can be used with bind or live event handling as you would use mouseenter,mouseleave, and hover
 * events fire after 200ms timeout
 * for full src, look here: https://gist.github.com/851230
*/
//(function(a){a.map("delayedEnter delayedLeave".split(" "),function(b){a.event.special[b]={enabled:true,setup:function(){var e=this,i=a(e),g=a.fn[b].delay,h,j;function f(l){var k=l.type;l.type=b;a.event.handle.call(e,l);l.type=k}function d(k){if(!a.event.special[b].enabled){return}h=true;clearTimeout(j);j=setTimeout(function(){if(h){f(k)}},g)}function c(k){h=false}i.bind({mouseenter:(b=="delayedEnter"?d:c),mouseleave:(b=="delayedEnter"?c:d)})}};a.fn[b]=function(c){return c?this.bind(b,c):this.trigger(b)};a.fn[b].delay=200;a.attrFn[b]=true});a.fn.delayedHover=function(b,c){return this.delayedEnter(b).delayedLeave(c||b)}})(jQuery);


/*
  * anchor-include pattern for already-functional links that work as a client-side include
  * Copyright 2011, Scott Jehl, scottjehl.com
  * Dual licensed under the MIT
  * Idea from Scott Gonzalez
  * to use, place attributes on an already-functional anchor pointing to content
    * that should either replace, or insert before or after that anchor
    * after the page has loaded
    * Replace:	<a href="..." data-replace="articles/latest/fragment">Latest Articles</a>
    * Before:	<a href="..." data-before="articles/latest/fragment">Latest Articles</a>
    * After:	<a href="..." data-after="articles/latest/fragment">Latest Articles</a>
    * On domready, you can use it like this: 
         $("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude();
*/
(function( $ ){
	$.fn.ajaxInclude = function( e ) {
		return this.each(function() {
			var el			= $( this ),
				target		= el.data( "target" ),
				targetEl	= target && $( target ) || el,
				threshold	= screen.width > parseInt( el.data( "threshold" ) || 0 ),
				methods		= [ "append", "replace", "before", "after" ],
				method,
				url;

			if (threshold) {

				for( var ml = methods.length, i=0; i < ml; i++ ){
					if( el.is( "[data-" + methods[ i ] + "]" ) ){
						method	= methods[ i ];
						url		= el.data( method );
					}
				}

				if( method === "replace" ){
					method += "With";
				}

				if( url && method ){
					$.get( url, function( data ) {
						var responseEl = $(data),
							eTarget = method === "replaceWith" ? responseEl : el;
						
						targetEl[ method ]( responseEl );	
						
						eTarget.trigger( "ajaxInclude", [eTarget, data] );
					});
				}

			}
		});
	};
})( jQuery );

(function( $, undefined ){

/* slide-down status messaging */
$.fn.statusmsg = function(){
	var msg = $( "<div class='bg-status-msg'></div>" ).append( this );
	$( "#masthead" ).before( msg );
	return msg;
};

$( document ).delegate( ".bg-status-close", "click",function(){
	$(this).closest( ".bg-status-msg" ).remove();
	return false;
});

})( jQuery );

/*
Boston Globe Common JS Scripting
- file includes misc scripting that applies to most templates
*/


(function(win, undefined){
	(function( $ ){
		// Touch event cue
		// visible for touch devices when a class of touchsupport-cue is on the body element
		if( globe.support.touch && $( "body" ).hasClass( "touchsupport-cue" ) ){
			setTimeout(function(){
			$( "<p><strong>Tip!</strong> Two-finger tap to save articles. <a href='#' class='bg-status-close remove'>Close</a></p>" )
				.statusmsg()
				.addClass( "touch-cue" );
			}, 500 );
		}

		$( function(){

		// checks if user is in 5%
			var isInFivePercent = function() {
				var num = Math.floor(Math.random() * 99) + 1;
				//console.log ("ethan returns "+num);
				if(num <= 5) {
					return true;
				}
			};

		// if in 5% and on meter 3, redirect to Rolling Free Trial page (or manually test with query string)
/*
			if( ( isInFivePercent() && methode.freeviewCountIncremented === true && methode.freeviewCount === 3) || window.location.search === '?freeTrialRedirect') {
				setTimeout(function() {
					window.location.replace('https://digitalaccess.bostonglobe.com/da/freetrial');
				}, 3000);
			}
*/
		//custom radio inputs
			$( ".radio-toggle" )
				.on( "update", function(){
					var checked = $( ".form-pair", this ).removeClass( "checked" ).filter( ":has(input:checked)" ).addClass( "checked" );
				})
				.on( "click change", function(){
					$(this).trigger("update");
				})
				.on("focusin", function( e ){
					$( e.target ).closest( ".form-pair" ).addClass( "focus" );
				})
				.on("focusout", function( e ){
					$( e.target ).closest( ".form-pair" ).removeClass( "focus" );
				})
				.trigger( "update" );

		// Most popular list
			$(".popular-list, .playlists").each(function() {
				var $oEl = $(this),
					$subheds = $oEl.find("nav > .hed-cat"),
					iMax = $subheds.length,
					$oNav = $('<ul class="nav" role="tablist" tabindex="0"></ul>'),
					sHide = "a11y-only",
					sNow = "now",
					keyNav = function($el, e) {
						var $tab = $el.parent(),
							$tabContainer = $tab.parent(),
							$prevTab = $tab.prev().find('a'),
							$nextTab = $tab.next().find('a'),
							$first = $tabContainer.find("li:first a"),
							$last = $tabContainer.find("li:last a");

						switch (e.which) {
							case 37:
							case 38:
								if($prevTab.length) {
									$prevTab.trigger('click').focus();
								} else {
									$last.trigger('click').focus();
								}
								return false;
								break;
							case 39:
							case 40:
								if($nextTab.length) {
									$nextTab.trigger('click').focus();
								} else {
									$first.trigger('click').focus();
								}
								return false;
								break;
							default:
								return true;
						}
					},
					selectTab = function($el) {
						var $oLink = $el,
							sSlug = "#" + $oLink.attr("href").split("#")[1],
							$oLists = $oEl.find("ol");

						$oEl.attr({
							'role' : 'application',
							'aria-activedescendant' : $(sSlug)[0].id
						});

						$oEl.find(".nav a")
							.removeClass(sNow)
							.attr({
								'tabindex': -1,
								'aria-selected': false
							});

						$oLink
							.addClass(sNow)
							.attr({
								'tabindex': 0,
								'aria-selected': true
							})
							.focus();

						$oLists
							.addClass(sHide)
							.attr({
								'aria-hidden': true
							})
							.hide()
							.find('*')
							.attr('tabindex', -1);

						$(sSlug)
							.removeClass(sHide)
							.attr({
								'aria-hidden': false
							})
							.show()
							.find('a, button')
								.attr('tabindex', 0);
					};

				if (iMax > 1) {
					for (var i = 0; i < iMax; i++) {
						var $oThis = $($subheds[i]);

						$oNav.append("<li>" + $oThis.html() + "</li>");
						$oThis.remove();
					}
					if($oEl.find("h1").length) {
						$oNav.insertAfter($oEl.find("h1"));
					} else {
						$oNav.prependTo($oEl);
					}

					$oEl.find('ol').each(function() {
						$(this).attr({
							'aria-labelledby' : 'tab-' + $(this)[0].getAttribute('id'),
							'role' : 'tabpanel'
						});
					});

					$oEl.attr({
						'role' : 'application',
						'aria-activedescendant' : $oEl.find('ol:first')[0].id
					});

					$oEl.find("ol:first")
							.attr({
								'aria-hidden': false
							})
							.find('li, a, button')
								.attr('tabindex', -1);

					$oEl.find("ol:not(:first)")
							.addClass(sHide)
							.attr({
								'aria-hidden': true
							})
							.find('a, button')
								.attr('tabindex', 0);

					$oEl.find(".nav li:first-child a")
							.addClass(sNow)
							.attr({
								'tabindex': 0,
								'aria-selected': true
							})
						.end()
						.find(".nav li a")
						.each(function() {
							$(this).attr({
								'id' : 'tab-' + $(this).attr("href").split("#")[1],
								'role' : 'tab',
								'title' : "most " + $(this).text() + " articles"
							});
						})
						.keydown(function(e) {
							keyNav($(this), e);
						})
						.click(function(e) {
							selectTab($(this));
							e.preventDefault();
						});
				}
			});

			// Special project tabbed nav
			$(".article-nav-series").each(function() {
				var $oEl = $(this),
					$subheds = $oEl.find("nav > .hed-part"),
					iMax = $subheds.length,
					$oNav = $('<ol class="nav" role="tablist" tabindex="0"></ol>'),
					sHide = "a11y-only",
					sActive = "active",
					keyNav = function($el, e) {
						var $tab = $el.parent(),
							$tabContainer = $tab.parent(),
							$prevTab = $tab.prev().find('a'),
							$nextTab = $tab.next().find('a'),
							$first = $tabContainer.find("li:first a"),
							$last = $tabContainer.find("li:last a");

						switch (e.which) {
							case 37:
							case 38:
								if($prevTab.length) {
									$prevTab.trigger('click').focus();
								} else {
									$last.trigger('click').focus();
								}
								return false;
								break;
							case 39:
							case 40:
								if($nextTab.length) {
									$nextTab.trigger('click').focus();
								} else {
									$first.trigger('click').focus();
								}
								return false;
								break;
							default:
								return true;
						}
					},
					selectTab = function($el) {
						var $oLink = $el,
							sSlug = "#" + $oLink.attr("href").split("#")[1],
							$oLists = $oEl.find("ol");

						$oEl.attr({
							'role' : 'application',
							'aria-activedescendant' : $(sSlug)[0].id
						});

						$oEl.find(".nav a")
							.removeClass(sActive)
							.attr({
								'tabindex': -1,
								'aria-selected': false
							});

						$oLink
							.addClass(sActive)
							.attr({
								'tabindex': 0,
								'aria-selected': true
							})
							.focus();

						$oLists
							.addClass(sHide)
							.attr({
								'aria-hidden': true
							})
							.hide()
							.find('*')
							.attr('tabindex', -1);

						$(sSlug)
							.removeClass(sHide)
							.attr({
								'aria-hidden': false
							})
							.show()
							.find('a, button')
								.attr('tabindex', 0);
					};

				if (iMax > 1) {
					for (var i = 0; i < iMax; i++) {
						var $oThis = $($subheds[i]);

						$oNav.append("<li>" + $oThis.html() + "</li>");
						$oThis.remove();
					}
					if($oEl.find("h1").length) {
						$oNav.insertAfter($oEl.find("h1"));
					} else {
						$oNav.prependTo($oEl);
					}

					$oEl.find('ol').each(function() {
						$(this).attr({
							'aria-labelledby' : 'tab-' + $(this)[0].getAttribute('id'),
							'role' : 'tabpanel'
						});
					});

					$oEl.attr({
						'role' : 'application',
						'aria-activedescendant' : $oEl.find('ol:first')[0].id
					});

					$oEl.find("ol:first")
							.attr({
								'aria-hidden': false
							})
							.find('li, a, button')
								.attr('tabindex', -1);

					$oEl.find("ol:not(:first)")
							.addClass(sHide)
							.attr({
								'aria-hidden': true
							})
							.find('a, button')
								.attr('tabindex', 0);

					$oEl.find(".nav li:first-child a")
							.addClass(sActive)
							.attr({
								'tabindex': 0,
								'aria-selected': true
							})
						.end()
						.find(".nav li a")
						.each(function() {
							$(this).attr({
								'id' : 'tab-' + $(this).attr("href").split("#")[1],
								'role' : 'tab',
								'title' : "most " + $(this).text() + " articles"
							});
						})
						.keydown(function(e) {
							keyNav($(this), e);
						})
						.click(function(e) {
							selectTab($(this));
							e.preventDefault();
						});
				}
			});

		// Homepage carousel
			var curate = function() {

				$(".inside .content").each(function() {
					var $oEl = $(this),
						sHtml = '<div class="slide"></div>';

					if (screen.width <= 480) {
						var perSlide = 2;
					} else {
						var perSlide = $oEl.attr('data-per-slide') || 4;
					}

					while ($oEl.children(".feat-thumb").length > 0) {
						$oEl.children(".feat-thumb").slice(0, perSlide).wrapAll(sHtml);
					}

					$oEl.children(".slide").each(function() {
						var tmp = 0,
							$slide = $(this);

						$slide.children(".feat-thumb").each(function() {
							var suffix = (tmp % 2 == 0) ? "odd" : "even";
							$(this).addClass("feat-" + suffix);

							tmp++;
						});
						$slide.find(".feat-thumb:last-child").addClass("last-feat");
					});
				});
			};

			curate();

		// For sub-list filtering (e.g., video filters)
			$('.see-all').collapsible();

		// Footer collapsible
		if( $("nav.opt").length){
			$('.bg-footer').each(function() {
				var cueText = {
						more : "More"
						,less : "Hide"
					}
					,sFooter = '<p id="bg-tools"><a href="#"><i class="' + cueText.more.toLowerCase() + '">' + cueText.more + '</i> Tools</a></p>';
				$(this)
					.prepend(sFooter);
				$("#bg-tools a")
					.collapsible({
						content: $( ".bg-footer nav.opt" )
					})
					.click(function() {
						var oCue = $(this).find("i"),
							sText = (oCue.text() == cueText.more) ? cueText.less : cueText.more;

						oCue
							.attr("class", sText.toLowerCase())
							.text(sText)
					});
			})
		}

		// Drop in markup for slide carousel
			var bg_slides = function() {
				$("[data-carousel]").not( ".slidewrap" ).each(function() {
					var $oEl = $(this),
						type = $oEl.attr('data-carousel'),
						$oSlides = $oEl.find(".slide"),
						tmp = Math.random().toString().slice(2, 12),
						sId = "carousel-" + tmp,
						sPrev = '<a class="prev" href="#' + sId + '"><i>Previous</i></a>',
						sNext = '<a class="next" href="#' + sId + '"><i>Next</i></a>',
						sTabHed = '<h2 class="carousel-tabs-head">View Slide</h2>',
						sTabCount = 'Slide {current} of {total}',
						sHTMLnav = [
							'<ul class="nav">',
							'	<li>' + sPrev + '</li>',
							'	<li>' + sNext + '</li>',
							'</ul>'
							].join('');

					if ($oSlides.length > 1 ) {
						// Insert previous/next arrows into the magazine preview slides
						if ($oEl.parent().hasClass("mag-preview")) {
							$(".mag-preview .slide:not(:first-child)").find(".date").prepend(sPrev);
							$(".mag-preview .slide:not(:last-child)").find(".date").append(sNext);
						}

						if (type == 'slideshow') {
							var $pagination = $('<ol class="carousel-tabs" role="tablist" tabindex="0" />'),
								$controls = $('<div class="slidecontrols" />');

							for (var i = 1; i < $oSlides.length + 1; i++) {
								$pagination.append('<li role="presentation"><a href="#carousel' + tmp + '-slide' + i + '" role="tab">' + i + '</a></li>');
							}

							$oSlides.each(function(i) {
								var $el = $(this);

								$el.attr({
									id : 'carousel' + tmp + '-slide' + i,
									'aria-labelledby' : 'carousel' + tmp + '-slide' + i
								});
							});

							$pagination
								.find('li:first')
									.addClass('current')
									.attr('aria-selected', "true");

							$controls.append(sHTMLnav, $pagination);

							$pagination
								.before(sTabHed);

							$oEl
								.addClass("slidewrap slideshow")
								.attr("tabindex", 0);

							if($oEl.find('.secondary').length) {
								$oEl
									.wrapInner('<div id="' + sId + '" class="slider"></div>')
										.prepend($controls);
							} else {
								$oEl
									.wrapInner('<div id="' + sId + '" class="slider"></div>')
										.append($controls);
							}
						} else {
							$oEl
								.addClass("slidewrap")
								.attr("tabindex", 0)
								.wrapInner('<div id="' + sId + '" class="slider"></div>')
								.before(sHTMLnav);

							if($oEl.parent().hasClass('frontpage-preview')) {
								$oEl.parent().parent().find('.header').prepend(sHTMLnav);
							}
						}
					} else {
						$oEl
							.removeAttr("data-carousel")
							.addClass('slidewrap');
					}

					// Trigger carousel(s)
					$(this)
						.carousel({
							slide: '.slide',
							slider: '.slider',
							nextSlide: '.next',
							prevSlide: '.prev',
							secondary: '.secondary',
							counter: '.carousel-tabs-head',
							counterText: sTabCount,
							speed: 500 // ms.
						});

					$(this)
						.find(".carousel-tabs-head")
						.collapsible();

				});
			}

			//init existing carousels on page
			bg_slides();



			//init carousels that are included through ajax and receive an ajaxInclude event
			$("[data-carousel-defer]")
				.on( "ajaxInclude", function() {
					$(this).attr("data-carousel", $(this).attr("data-carousel-defer" ) );

					//init existing carousels on page
					bg_slides();
				});

			//find gallery link (located near carousel per CMS constraints) and append to related / discuss links
			$( ".type-home .related-gallery, .type-internal .related-gallery" ).each(function(){
				var discussLinks = $(this).parent().find(  ".story-discuss" );
				if( discussLinks.length ){
					discussLinks.append( $("<li>").append( $(this).find( "a" ) ) )
					$(this).remove();
				}
			});


			// Trigger sticky scrolling on ".quicknav" sidebar elements (ie: Today’s Paper, Staff Bio).
			$('.quicknav').stickyScroll();

			$("[data-linked-radios]")
				.on( "change", function(e){
				    var linkedInput = ( e.target.id.indexOf('quicknav-') === 0 ) ? e.target.id.substring(9, e.target.id.length) : "quicknav-" + e.target.id,
						current = $(this).attr('data-linked-radios');

					$('#' + linkedInput).trigger("click");
					$( "[data-linked-radios='" + current + "']" ).trigger( "update" );
				})
				.trigger( "update" );


			if ( window.screen.width > 480 && globe.section !== "my-saved" ) {
				// Intercept the page request and swap the src/fullsrc as appropriate.
					$.ajaxSetup({
						dataFilter: function(data, type){
							if(typeof data !== 'undefined') {
								return data.replace( /(<img src=")([^"]+.r.(jpe?g|gif|png))(" [^>]*data-fullsrc="([^"]+)"[^>]*>)/gi, "$1$5$4");
							}
						}
					});
			}

			if (window.screen.width > 480) {

				if (!globe.support.touch) {
				// Convert form.picker to nav.picker
					$("form.picker").each(function() {
						var $form = $(this),
							sLabel = $form.find("label").html(),
							$select = $form.find("select"),
							sSlug = $select.attr("id"),
							$options = $select.find("option"),
							iMax = $options.length,
							sTemplate = [
								'<nav class="picker ' + sSlug + '">',
								'	<h1><a href="#' + sSlug + '" class="top">' + sLabel + '</a></h1>',
								'	<div id="town-picker">',
								'	<ol></ol>',
								'	</div>',
								'</nav>'
							].join(''),
							$picker = $(sTemplate),
							$list = $picker.find("ol");

						for (var i = 0; i < iMax; i++) {
							var opt = $($options[i]),
								val = opt.attr("value"),
								sel = (opt.attr("selected")) ? ' class="now"' : '',
								txt = opt.html();

							$list.append('<li><a' + sel + ' href="#' + val + '">' + txt + '</a></li>')
						}

						$form.replaceWith($picker);
					});
				// Town picker on Section pgs
					$(".picker a.top").on('click', function() {
						$(this).parents(".picker").toggleClass("picker-on");
					});
				}

			}

		// Calendar methods
			globe.helpers.calendar = {
				onlySUNDAYS : function(date) {
					var day = date.getDay();
					return [(day == 0), ''];
				}
			};

		});


		// Simple form validation for login page and article stub login
		if($('.login-form').length){
			// Login form validation
			function get_value( input ) {
			    return input.is(':checkbox,:radio') ? input.is(':checked') : input.val();
			  };

			// Basic "required field" validation.
			$('form.login-form').on("submit", function(e){
				form_valid = true;

			    $(this).find('.form-required').each(function(){
				      var fieldset = $(this),
				        fieldset_err = fieldset.find( '.regi-error' ),
				        fields_valid,
				        fields_changed;

					  // can be multiple fields in a fieldset, so run .each() over current fieldset
				      fieldset.find('input, select').each(function(){
				        var input = $(this);

						// return true or false for current field
				        fields_valid = fields_valid || ( input.is(':checkbox, :radio')
				          ? input.prop('checked') : $.trim( input.val() ) !== '' );

						// returns true or false for current field
				        fields_changed = fields_changed || ( input.data( 'CURRENT' ) !== get_value( input ) );
				        input.data( 'CURRENT', get_value( input ) );
				      });

				      if ( fields_changed || !fields_valid ) {
				        fieldset.toggleClass( 'regi-error', !fields_valid );

				      }

				      form_valid = form_valid && fields_valid;
				});
				//console.log($('.form-required').length); return false;

				if( !form_valid ) {

					$('.js-gen-error').length ? null : $('.login-form .errorlist').remove();

					if(!$('.js-gen-error').length){
			      		$('form.login-form')
							.before('<div class="errorlist js-gen-error">One or more required fields is missing.	</div>');
				  	 }

				      e.preventDefault();
				}
			});
		}

		// Timestamp rendering calculations
		var currentTime = (new Date()).getTime(),
			offset = (new Date()).getTimezoneOffset();
		$('[data-pubtime]').each(function() {
			var pubTime = $(this).attr('data-pubtime'),
				year = parseInt(pubTime.slice(0,4)),
				// There is a -1 in the following,
				// because JS thinks Jan is month 0, don't you?
				month = parseInt(pubTime.slice(4,6))-1,
				day = parseInt(pubTime.slice(6,8)),
				hour = parseInt(pubTime.slice(8,10)),
				minute = parseInt(pubTime.slice(10,12)),
				seconds = parseInt(pubTime.slice(12,14)),
				pubDate = new Date((new Date(year, month, day, hour, minute, seconds))-(offset*1000*60)),
				pubTime = pubDate.getTime(),
				diff = parseInt((currentTime-pubTime)/1000/60);
			if (diff>0) {
				if (diff<1) {
					$(this).html("Less than 1 minute ago");
				} else if (diff<2) {
					$(this).html("1 minute ago");
				} else if (diff < 60) {
					$(this).html(diff+" minutes ago");
				} else if (diff < 180) {
					var meridian = " am",
						hours = pubDate.getHours(),
						minutes = pubDate.getMinutes();
					if (hours > 11) {
						meridian = " pm";
						if (hours > 12) hours = hours-12;
					}
					if (minutes < 10) minutes = "0"+minutes;
					$(this).html(hours+":"+minutes+meridian);
				}
			}
		});

if ($('#sponcon').length){
	var s=s_gi('nytbostonglobecom,nytbostonglobesponsored');
    s.linkTrackVars='channel,prop50,prop32,prop38,prop1,eVar15';
    s.linkTrackEvents='event31';
    s.events='event31';
    s.tl(this,'o','BG Sponsored Well - Impression');
}
if ($('.rockland-triggered').length) {
            var s=s_gi('nytbostonglobecom,nytbostonglobesponsored');
            s.linkTrackVars='channel,prop50,prop32,prop6,prop1,eVar15';
            s.linkTrackEvents='event33';
            s.prop50='RFT Homepage';
            s.prop32='Rockland Trust';
            s.events='event33';
            s.tl(this,'o','BG Sponsored RFT - Impression');
}



	})( jQuery );

	// omniture link-tracking
	(function( $ ){
    	var config = {
        	url : 'nytbostonglobecom',
        	type : 'o'
    	};

    	$( document ).delegate( '[data-omniture]', 'click', function(){
        	var link_name = $( this ).data('omniture');
        	s_gi( config.url );
        	s.tl( this, config.type, link_name );
    	});

    	// hide static saved buttons for not logged in
    	if (!globe.cookie.get( "pathAuth" )) {
			$('.server-saveable').hide();
		}


		// Regi link tracking
		$(document).delegate('[data-auth-analytics]', 'click', function() {
			var trackParams = $(this).data('auth-analytics');
			//console.log(trackParams); return false;
			s = $.extend( {}, s, trackParams );
			s.tl(this, config.type, trackParams.linkName);
		});



	})( jQuery );

})(this);

// non-jQuery functions
globe.util = {
	"url": {
		"base": window.location.href.split('#')[0],
		"basePath": window.location.pathname,
		"section": window.location.pathname.split('/')[1].charAt(0).toUpperCase() + window.location.pathname.split('/')[1].slice(1),

		// http://stackoverflow.com/a/5298684/214325
		// http://stackoverflow.com/a/11471401/214325
		"replaceHash": function replaceHash( hash ) {
			var loc = window.location;
			var scrollV = document.body.scrollTop;
			var scrollH = document.body.scrollLeft;
			var base = globe.util.url.base;
			var historySupported = ( window.history && window.history.replaceState );

			if ( historySupported ) {
				hash = hash || '';
				//if state is present, state was replaced from an inline article.
				if(window.history.state){
					history.replaceState({},'',window.location.href.replace(location.hash,"") + hash);
				}else{
					history.replaceState( {}, '', base + hash );
				}
			} else {
				hash = hash || '#';
				loc.replace( base + hash );
				document.body.scrollTop = scrollV;
				document.body.scrollLeft = scrollH;
			}
		},
		// "replaceQuery": function replaceQuery( query ) {
		// 	var loc = window.location;
		// 	var base = globe.util.url.base;
		// 	//var hash = loc.hash;
		// 	var newUrl = base + query;

		// 	console.log( newUrl );

		// 	loc.replace( newUrl );
		// }
	},
    "pluralize": function pluralize( word, qty ) {
        qty = qty || 0;
        word = word || 'unit';

        var suffix = ( ( qty === 0 ) || ( qty > 1 ) ? 's' : '' );

        return word + suffix;
    }
};


if (typeof globe === 'undefined') { globe = {}; }
(function( win, $, undefined ) {
  'use strict';
	var module = {};

	module.originalText = $('.bg-header__smartbar--text').text();

	module.shortenSmartbarWord = function() {

		var $article = $('.type-article'),
				$home = $('.type-home'),
				$section = $('.type-internal:not(.type-article)'),
				$breaking = $('.bg-header__smartbar--breaking'),
				$message = $('.bg-header__smartbar--message'),
				$smartbarContent = $breaking.length ? $breaking : $message.length ? $message : $('non-existent'),
				$textSpan = $('.bg-header__smartbar--text'),
				$textSpanBold = $('.bg-header__smartbar--text-bold');

		if ( $('.logged-in').length && $smartbarContent.length && $textSpan.css('white-space') !== 'nowrap') {
			if($smartbarContent.outerHeight() > 38) {
				var percent = (12 / $textSpan.height()) * 2,
						textLength = $textSpan.text().length - 10,
						textLengthAfterCut = Math.floor(textLength * percent);
				$textSpan.html(module.originalText.substring(0, textLengthAfterCut) + '...');
			}
		} else if( $article.length && $message.length ) {
			var boldWidth = $textSpanBold.length ? $textSpanBold.width() + 10 : 0,
					textWidth = $textSpan.width(),
					parentWidth = $message.width();

			if( (boldWidth + textWidth) > parentWidth ) {
				var difference = (boldWidth + textWidth) - parentWidth,
						textChars = $textSpan.text().length,
						percentOfTextSpan = 1 - (difference / textWidth),
						textCharsAfterCut = Math.floor(textChars * percentOfTextSpan) - 2;

				$textSpan.text(module.originalText.substring(0,textCharsAfterCut) + '...');

			}
		}

		$('.bg-header__smartbar').addClass('bg-header__smartbar--show');

  };

	module.addVeil = function() {
		var $header = $('.bg-header'),
			$breaking = $('.bg-header__smartbar--breaking'),
			$topTools = $('.Top.tools'),
			text = $('.bg-header__smartbar--text').text(),
			link = $('.bg-header__smartbar--breaking').attr('href'),
			animations = 'webkitAnimationEnd oanimationend msAnimationEnd animationend',
			markup;

		markup = [
		'<div class="bg-header__smartbar--veil bg-header__smartbar--veil-show">',
			'<a href="' + link + '" class="bg-header__smartbar--breaking">' + text  +'</a><div class="bg-header__close-veil js-close-veil"></div>',
		'</div>'
		].join('');

		if($breaking.length) {
			$(markup).insertAfter('.bg-header');
		}

		var $showVeil = $('.bg-header__smartbar--veil-show');

		$('.js-close-veil').on('click', function(e) {
			if( $('.bg-header__smartbar--veil').hasClass('bg-header__smartbar--veil-sticky') || $('.sticky-tools .bg-header__smartbar--veil').length ) {
				$('.bg-header__smartbar--veil').removeClass('bg-header__smartbar--veil-show').removeClass('bg-header__smartbar--veil-sticky').addClass('bg-header__smartbar--veil-sticky-hide');
			} else {
				$('.bg-header__smartbar--veil').removeClass('bg-header__smartbar--veil-show').addClass('bg-header__smartbar--veil-hide');
			}
		});

		// wait for animation to complete to grab offset
		$('.bg-header__smartbar--veil-show').on(animations, function() {
			module.veilTop = $(this).offset().top - 3;
		});

		$(document).on('scroll', function() {
			var $veil = $('.bg-header__smartbar--veil');

			if( $('.type-article').length || $('.sticky-tools').length ) {
				if(!$('.sticky-tools .bg-header__smartbar--veil').length && !$('.bg-header__smartbar--veil-sticky-hide').length && $(document).scrollTop() >= module.veilTop && !$veil.hasClass('bg-header__smartbar--veil-hide') ) {
					$veil.addClass('bg-header__smartbar--veil-show');
					$('.sticky-tools').append($veil);
				} else if( $('.sticky-tools .bg-header__smartbar--veil').length && $(document).scrollTop() < module.veilTop ) {
					$veil.insertAfter('.bg-header').removeClass('bg-header__smartbar--veil-show').addClass('bg-header__smartbar--veil-shadow');
				}
			} else if( !$('.type-article').length && $(document).scrollTop() >= module.veilTop && !$veil.hasClass('bg-header__smartbar--veil-sticky-hide') && !$veil.hasClass('bg-header__smartbar--veil-hide') ) {
				$veil.addClass('bg-header__smartbar--veil-sticky');
			} else if( $(document).scrollTop() < module.veilTop ) {
				$veil.removeClass('bg-header__smartbar--veil-sticky');
			}
		});
	};


  // ------------------------------------------------------------
  //  * Event Handlers
  // ------------------------------------------------------------

  module.eventHandlers = function() {
    $(".bg-header__navmore-button").on('click touchend',
      function(e) {
        e.stopPropagation();
        e.preventDefault();
        if($(e.target).parent().hasClass("bg-header__navmore--active")) {
        	$(e.target).parent().removeClass('bg-header__navmore--active');
        	$('.bg-header__nav').removeClass('bg-header__nav--more-opened');
        } else {
        	$(e.target).parent().addClass("bg-header__navmore--active");
        	$('.bg-header__nav').addClass('bg-header__nav--more-opened');
        }

      });

    $("body").on('click',
      function(e) {
        $(".bg-header__nav li").removeClass("bg-header__navmore--active");
        $('.bg-header__nav').removeClass('bg-header__nav--more-opened');

        var $this = $(e.target),
			$settingsPopup = $this.siblings('.bg-header__settings-pop-up'),
			offset = $this.parent().position(),
			height = $this.outerHeight();

        if( $this.hasClass('js-open-settings') && !$settingsPopup.hasClass('bg-header__settings-pop-up--show') ) {
			$settingsPopup.css({
				'top': offset.top + height + 21 + 'px'
			});
			$settingsPopup.removeClass('bg-header__settings-pop-up--hide').addClass('bg-header__settings-pop-up--show');
        } else if( !$this.hasClass('.bg-header__settings-text-size') && $('.bg-header__settings-pop-up').hasClass('bg-header__settings-pop-up--show') ) {
        	$('.bg-header__settings-pop-up').removeClass('bg-header__settings-pop-up--show').addClass('bg-header__settings-pop-up--hide');
        }

      });

    $(".bg-header__smartbar--scoreboard-next")
      .on("click",function() {
        var $oldActive = $(".bg-header__smartbar--scoreboard-game--active"),
			$newActive = $oldActive.next(),
			$scoreboard = $('.bg-header__smartbar--scoreboard');

        if (!$newActive.length) {
          $newActive = $oldActive.siblings().first();
        }

        if($('.type-article').length) {
        	$oldActive.removeClass("bg-header__smartbar--scoreboard-game--active").addClass('bg-header__smartbar--scoreboard-game--hide');
        	$newActive.removeClass('bg-header__smartbar--scoreboard-game--hide').addClass("bg-header__smartbar--scoreboard-game--active");
        } else {
        	$scoreboard.animate({
	        	width: $newActive.outerWidth() + 'px'
	        }, 250, function() {
	        	$oldActive
	        		.removeClass("bg-header__smartbar--scoreboard-game--active")
	              	.addClass('bg-header__smartbar--scoreboard-game--hide');
	        	$newActive.removeClass('bg-header__smartbar--scoreboard-game--hide').addClass("bg-header__smartbar--scoreboard-game--active");
	        });
        }
      });

		if ( $('.js-open-menu').length ) {
			$('.js-open-menu').on('click', function(event) {

				event.preventDefault();
				var $takeover = $('.bg-header__takeover'),
				$fullScreen = $('.bg-header__takeover-full-screen'),
				$popup = $('.bg-header__pop-up'),
				animations = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

				if($popup.hasClass('bg-header__pop-up--show')) {
					$popup.removeClass('bg-header__pop-up--show').addClass('bg-header__pop-up--hide');
				}

				$fullScreen.addClass('bg-header__takeover-full-screen--show');
				$takeover
					.removeClass('bg-header__takeover--close')
					.addClass('bg-header__takeover--open');
				$('.bg-header__menu-wrapper').removeClass('bg-header__menu-wrapper--hidden').addClass('bg-header__menu-wrapper--visible');

				$takeover.on(animations, function(e) {
					// code to execute after animation ends
					$('body, html').addClass('takeover-overflow-hide');
					$(this).off(animations);
				});

			});
		}

		if ( $('.js-close-menu').length ) {
			$('.js-close-menu').on('click', function(event) {
				var $takeover = $('.bg-header__takeover'),
						$fullScreen = $('.bg-header__takeover-full-screen'),
						$popup = $('.bg-header__pop-up'),
						animations = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

				if($popup.hasClass('bg-header__pop-up--show')) {
					$popup.removeClass('bg-header__pop-up--show').addClass('bg-header__pop-up--hide');
				}

				$takeover.removeClass('bg-header__takeover--open').addClass('bg-header__takeover--close');
				$('.bg-header__menu-wrapper').removeClass('bg-header__menu-wrapper--visible').addClass('bg-header__menu-wrapper--hidden');
				$('body, html').removeClass('takeover-overflow-hide');


				$takeover.on(animations, function(e) {
					$fullScreen.removeClass('bg-header__takeover-full-screen--show');
					$(this).off(animations);
				});
			});
		}

		if( $('.js-open-search').length ) {
			$('.js-open-search').on('click', function() {

				var s;

				if( $('.bg-search-takeover').length && $('.bg-search-takeover').hasClass('bg-search-takeover--closed') ) {
					$(this).addClass('bg-header__search-tool--border');
					$('.bg-search-takeover').removeClass('bg-search-takeover--closed').addClass('bg-search-takeover--open');

					$('#main').css({'position': 'relative'});
					$('.bg-col-c').css({'overflow': 'hidden'});

					s=s_gi('nytbostonglobecom');
					s.linkTrackVars='channel,prop1,prop6,eVar15';
					s.linkTrackEvents='none';
					s.tl(this,'o','BG Header - Search Open');

					$(".bg-search-takeover__input").focus();

				} else if( $('.bg-search-takeover').length && $('.bg-search-takeover').hasClass('bg-search-takeover--open') ) {
					$(this).removeClass('bg-header__search-tool--border');
					$('.bg-search-takeover').removeClass('bg-search-takeover--open').addClass('bg-search-takeover--closed');
					$('#main').css({'position': 'static'});
					$('.bg-col-c').css({'overflow': 'visible'});
				} else {
					var html = [
						'<form action="/queryResult/search" class="bg-search-takeover bg-search-takeover--open" method="get" role="search">',
							'<div class="search-inputs">',
								'<div class="bg-search-takeover__close js-close-search"></div>',
								'<input type="text" class="bg-search-takeover__input" id="q" placeholder="Search BostonGlobe.com" role="search" name="q">',
								'<button type="submit" class="bg-search-takeover__button"></button>',
							'</div>',
						'</form>'
					].join('');

					$(this).addClass('bg-header__search-tool--border');
					$('#main').css({'position': 'relative'}).prepend(html);
					$('.bg-col-c').css({'overflow': 'hidden'});
					$(".bg-search-takeover__input").focus();

					// Fix for ad not being responsive
					// TODO: fix ad overflow issue
					$('.bg-col-c').css({'overflow': 'hidden'});

					$('.js-close-search').on('click', function() {
						$('.bg-search-takeover').removeClass('bg-search-takeover--open').addClass('bg-search-takeover--closed');
						$('.bg-header__search-tool').removeClass('bg-header__search-tool--border');
						// Fix for ad not being responsive
						$('.bg-col-c').css({'overflow': 'visible'});
					});

					$('.bg-search-takeover').on('submit', function() {
						s=s_gi('nytbostonglobecom');
						s.linkTrackVars='channel,prop1,prop6,prop22,eVar11,eVar15';
						s.linkTrackEvents='event35';
						s.prop22=s.eVar11= $('.bg-search-takeover__input').val();
						s.events='event35';
						s.tl(this,'o','BG Header - Search Submit');
					});

					s=s_gi('nytbostonglobecom');
					s.linkTrackVars='channel,prop1,prop6,eVar15';
					s.linkTrackEvents='none';
					s.tl(this,'o','BG Header - Search Open');
				}

			});
		}

		if($('.bg-header__search').length) {
			$('.bg-header__search').on('submit', function() {
				var s=s_gi('nytbostonglobecom');
				s.linkTrackVars='channel,prop1,prop6,prop22,eVar11,eVar15';
				s.linkTrackEvents='event35';
				s.prop22=s.eVar11= $('.bg-header__input').val();
				s.events='event35';
				s.tl(this,'o','BG Menu - Search Submit');
			});
		}

		$(window).on('debouncedresize', function() {
			module.shortenSmartbarWord();

			if($(".bg-header__smartbar--scoreboard-game").length) {
				var $scoreboard = $('.bg-header__smartbar--scoreboard'),
						$activeGame = $(".bg-header__smartbar--scoreboard-game--active");

				$scoreboard.animate({
			    	width: $activeGame.outerWidth() + 'px'
			    }, 250);
			}
		});
	};



  // ------------------------------------------------------------
  //  * Init
  // ------------------------------------------------------------

  module.init = function() {
		module.eventHandlers();
		module.shortenSmartbarWord();
		module.addVeil();

		if( $('.bg-header__smartbar--breaking').length || $('.bg-header__smartbar--message').length ) {
			$('.bg-header__smartbar--breaking').addClass('bg-header__smartbar--breaking-show');
			$('.bg-header__smartbar--message').addClass('bg-header__smartbar--message-show');
		}
		if($(".bg-header__smartbar--scoreboard-game").length <= 1) {
			$(".bg-header__smartbar--scoreboard-game").addClass("bg-header__smartbar--scoreboard-game--only");
		} else if(!$('.type-article').length && $('.bg-header__smartbar').css('float') === 'none') {
			var $scoreboard = $('.bg-header__smartbar--scoreboard'),
				$firstGame = $(".bg-header__smartbar--scoreboard-game").first(),
				firstGameWidth = $(".bg-header__smartbar--scoreboard-game").first().outerWidth();
			$scoreboard.animate({
		    	width: firstGameWidth + 'px'
		    }, 250, function() {
		    	$firstGame.addClass("bg-header__smartbar--scoreboard-game--active");
		    });
		} else {
			$(".bg-header__smartbar--scoreboard-game").first().addClass("bg-header__smartbar--scoreboard-game--active");
		}
  };


  // Kickoff
  $(document).ready(function() {
    if ($('.bg-header').length) { module.init(); }
  });

})(window, jQuery);


(function($){
	var $body = $("body");
	var $masthead = $("#masthead");
	var $contain = $("#contain");
	var $sectionBar = $("#masthead .section");
	var $mastheadSpacer = $(".masthead-spacer");

	var resizeSpacer = function(d) {
		var sb = 0;
		if ($sectionBar.css("position")==="absolute") {
			sb = $sectionBar.height();
		}
		var topMargin = 0;
		if ($masthead.css("position")==="fixed") {
			topMargin = parseInt($contain.css("margin-top"));
		}
		$mastheadSpacer.height($masthead.height()+sb-topMargin);
	};

	var stuck = false;
	var checkStuck = function(d) {
		var newStuck;
		if (stuck) {
			newStuck = ($mastheadSpacer.offset().top < $(window).scrollTop());
		} else {
			newStuck = ($masthead.offset().top < $(window).scrollTop());
		}
		if (newStuck != stuck) {
			stuck = newStuck;
			$body.toggleClass("masthead-stuck",stuck);
			if (stuck) {
				$masthead
					.css("top",$mastheadSpacer.offset().top - $(window).scrollTop())
					.animate({top:0},200);
			}
		}
	};

	if (($masthead.length>0) && ($mastheadSpacer.length>0)) {
		$(window).resize(resizeSpacer);
		resizeSpacer();
		if (!$body.hasClass("type-article") && !$body.hasClass("big-picture")) {
			$(window).scroll(checkStuck);
			checkStuck();
		}
	}

})( jQuery );


/*! Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with divs). Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2 */

(function( w ){
	
	// Enable strict mode
	"use strict";

	w.picturefill = function() {
		var ps = w.document.getElementsByTagName( "div" );
		
		// Loop the pictures
		for( var i = 0, il = ps.length; i < il; i++ ){
			if( ps[ i ].getAttribute( "data-picture" ) !== null ){

				var sources = ps[ i ].getElementsByTagName( "div" ),
					matches = [];
			
				// See if which sources match
				for( var j = 0, jl = sources.length; j < jl; j++ ){
					var media = sources[ j ].getAttribute( "data-media" );
					// if there's no media specified, OR w.matchMedia is supported 
					if( !media || ( w.matchMedia && w.matchMedia( media ).matches ) ){
						matches.push( sources[ j ] );
					}
				}

			// Find any existing img element in the picture element
			var picImg = ps[ i ].getElementsByTagName( "img" )[ 0 ];

			if( matches.length ){			
				if( !picImg ){
					picImg = w.document.createElement( "img" );
					picImg.alt = ps[ i ].getAttribute( "data-alt" );
					ps[ i ].appendChild( picImg );
				}
				
				picImg.src =  matches.pop().getAttribute( "data-src" );
			}
			else if( picImg ){
				ps[ i ].removeChild( picImg );
			}
		}
		}
	};
	
	// Run on resize and domready (w.load as a fallback)
	if( w.addEventListener ){
		w.addEventListener( "resize", w.picturefill, false );
		w.addEventListener( "DOMContentLoaded", function(){
			w.picturefill();
			// Run once only
			w.removeEventListener( "load", w.picturefill, false );
		}, false );
		w.addEventListener( "load", w.picturefill, false );
	}
	else if( w.attachEvent ){
		w.attachEvent( "onload", w.picturefill );
	}
	
}( this ));

(function(win, undefined){
	(function( $ ){
		
		//domready
		$( function(){
		
		//inject facebook iframe on wider than 480px
			/*
				NB. The div.facebook-like elements can now accept optional parameters via data- attributes:
					* data-url: String. URL that should be "liked." Defaults to URL of the current page, minus location.hash.
					* data-layout: String. Possible values, per http://developers.facebook.com/docs/reference/plugins/like/: standard, button_count, box_count. (Defaults to "button_count")
					* data-height: Integer. Height of the element in pixels. (Defaults to 20.)
					* data-width: Integer. Width of the element in pixels. (Defaults to 90.)
					* data-verb: String. Verb that appears inside the widget. (Defaults to "like")

				By default, <div class="facebook-like"></div> will include a "button_count"-style FB widget, sized at 90x20, that references the current page.

				With optional attributes, <div class="facebook-like" data-layout="box_count" data-url="http://example.com/" data-width="100" data-height="100"><!--facebook inject here --></div> would render a "box_count"-style FB widget that is 100x100, and directs "likes" to example.com.
			*/
			if (screen.width > 480 && !(globe && globe.dev && globe.dev.mobileOverride) ) {
				$(".facebook-like").each(function() {
					var oDiv = $(this)
						,params = {
							url		: (oDiv.data("url")) ? oDiv.data("url") : window.location.href.split("#")[0]
							,layout	: (oDiv.data("layout")) ? oDiv.data("layout") : "button_count"
							,height	: (oDiv.data("height")) ? parseInt(oDiv.data("height")) : 20
							,width	: (oDiv.data("width")) ? parseInt(oDiv.data("width")) : 125
							,verb	: (oDiv.data("verb")) ? parseInt(oDiv.data("verb")) : "recommend"
						}
						,sURL = escape(params.url+'?emtaf')

					// Replace the DIV
					oDiv.replaceWith('<iframe class="fblike" src="http://www.facebook.com/plugins/like.php?href=' + sURL + '&amp;layout=' + params.layout + '&amp;action=' + params.verb + '&amp;font=lucida+grande&amp;colorscheme=light" scrolling="no" frameborder="0" style="width: ' + params.width + 'px; height: ' + params.height + 'px; " allowTransparency="true"></iframe>');
				});
			}

		//append,
			$("[data-append],[data-replace],[data-after],[data-before]").ajaxInclude();
			
		// Google+ button
		/*
		if( screen.width > 480){
			var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
			po.src = 'https://apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0]; 
			s.parentNode.insertBefore(po, s);
		} */
			
		});//domready
	}( jQuery ));
}( window ));