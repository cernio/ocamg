/**
 * @author mmoossen
 */
(function($) {
	jQuery.fn.picFrame = function (frameName, opts) {
		return this.each(function() {
			var $img = $(this);
			var frame = frames[frameName];
			if (frame === undefined) {
				return;
			}
			frame.applyFn.apply(frame, [$img]);
		});
	};

	var Frame = function(/** {String} */ pName, /** {Function} */ pApplyFn) {
		this.name = pName;
		this.applyFn = pApplyFn;
	};
	
	var /** {Hash<String, Frame>} */ frames = {};
	var /** {Array<String>} */ frameNames = [];
	
	$.picFrames = {
		add: /** {void} */ function(/** {Frame} */ frame) {
			if (frameNames.indexOf(frame.name) > -1) {
				return;
			}
			frameNames.push(frame.name);
			frames[frame.name] = frame;
		},
		all: /** {Array<String>} */ function() {
			return frameNames;
		}
	};
	$.picFrames.add(new Frame('gold-frame', function($img) {
		var $span = $img.siblings('span'), exists = ($span.length != 0);
		if (!exists) {
			$span = $('<span></span>');
		}
		$span.addClass(this.name);
		$span.css({ 
			width: ($img.width() - 10) + 'px',
			height: ($img.height() - 10) + 'px'
		});
		if (!exists) {
			$img.before($span);
		}
	}));
	$.picFrames.add(new Frame('black-frame', function($img) {
		var $span = $img.siblings('span'), exists = ($span.length != 0);
		if (!exists) {
			$span = $('<span></span>');
		}
		$span.addClass(this.name);
		$span.css({ 
			width: ($img.width() - 10) + 'px',
			height: ($img.height() - 6) + 'px'
		});
		if (!exists) {
			$img.before($span);
		} else {
			$span.find('em').css({
				width: ($img.width() - 10) + 'px',
				paddingTop: ($img.height() - 6 + 10) + 'px'				
			});
		}
	}));
	$.picFrames.add(new Frame('cut-corner', function($img) {
		var $span = $img.siblings('span'), exists = ($span.length != 0);
		if (!exists) {
			$span = $('<span></span>');
		}
		$span.addClass(this.name);
		var borderWidth = 25, offset = -5, margin = 4;
		var diff = (borderWidth + offset - margin) * 2;
		$span.css({ 
			width: ($img.width() - diff) + 'px',
			height: ($img.height() - diff) + 'px'
		});
		if (!exists) {
			$img.before($span);
		}
	}));
	$.picFrames.add(new Frame('stamp', function($img) {
		var $span = $img.siblings('span'), exists = ($span.length != 0);
		if (!exists) {
			$span = $('<span></span>');
		}
		$span.addClass(this.name);
		$span.css({ 
			width: ($img.width() - 10) + 'px',
			height: ($img.height() - 10) + 'px'
		});
		if (!exists) {
			$img.before($span);
		}
		$img.addClass(this.name);
	}));
})(jQuery);
