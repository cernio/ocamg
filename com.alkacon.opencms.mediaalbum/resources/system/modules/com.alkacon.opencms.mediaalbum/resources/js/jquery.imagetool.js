;
(function($){
    var round = function(value, decimals){
        if (!decimals || isNaN(parseInt(decimals))) {
	  // console.log('round:' + decimals);
            decimals = 0;
        }
        decimals = parseInt(decimals);
        var factor = 1;
        for (var i = 0; i < decimals; i++) {
            factor = factor * 10;
        }
	if (isNaN(parseFloat(value))) {
	  //console.log('round:' + value);
	  return 0;
	}
	// fix: parseInt(parseFloat(0.29) * 100) / 100 == 0.28 :S!
        return parseInt((parseFloat(value) + 0.000000000001) * factor) / factor;
    };
    
    var ImageToolData = function($image, options){
        // build element specific options
        var opts = $.metadata ? $.extend({}, options, $image.metadata()) : options;
        
        this.offset = {
            top: opts.top,
            left: opts.left
        };
        this.zoomOpts = {
            max: opts.maxZoom,
            min: opts.minZoom,
            enabled: opts.allowZoom
        };
        
        this.allowPan = opts.allowPan;
        this.zoom = opts.zoom;
        this.callback = opts.callback;
        
        this.viewport = {
            width: $image.width(),
            height: $image.height()
        };
        // temporary un-accurate data
        this.current = {
            width: -1,
            height: -1
        };
        this.actual = {
            width: $image.width(),
            height: $image.height()
        };
    };
    
    var handleMouseDown = function(mousedownEvent){
        mousedownEvent.preventDefault();
        var $image = $(this);
        var itd = $image.data("itd");
        var origoX = mousedownEvent.clientX;
        var origoY = mousedownEvent.clientY;
        var offset = $image.offset({
            scroll: false
        });
        var clickX = (mousedownEvent.pageX - offset.left);
        var clickY = (mousedownEvent.pageY - offset.top);
        if (itd.controls) {
            $(itd.controls).hide();
        }
        if (itd.zoomOpts.enabled && (mousedownEvent.shiftKey || mousedownEvent.ctrlKey)) {
            $image.bind("mousemove.imagetool", function(e){
                e.preventDefault();
                var scale = (origoY - e.clientY) / 10;
                var factor = (scale + 1) * itd.zoom;
                if ($image.itResize(factor, itd.callback)) {
                    origoY = e.clientY;
                }
            });
        }
        else 
            if (itd.allowPan) {
                $image.bind("mousemove.imagetool", function(e){
                    e.preventDefault();
                    var factor = itd.zoom >= itd.viewport.width / itd.actual.width ? itd.zoom : 1;
                    var deltaX = (origoX - e.clientX) * 5 * factor;
                    var deltaY = (origoY - e.clientY) * 5 * factor;
                    $image.itMove(deltaX, deltaY, itd.callback);
                    origoX = e.clientX;
                    origoY = e.clientY;
                });
            }
        return false;
    };
    
    var buttonsOpts = {
        step: 10,
        speed: 50,
        buttonWidth: 20,
        buttonHeight: 20,
        opacity: 0.6
    };
    var buttonsData = [{
        title: 'Pan Left',
        icon: 'ui-icon-circle-arrow-w',
        panX: -1,
        panY: 0,
        top: 1,
        left: 0
    }, {
        title: 'Pan Up',
        icon: 'ui-icon-circle-arrow-n',
        panX: 0,
        panY: -1,
        top: 0,
        left: 1
    }, {
        title: 'Pan Right',
        icon: 'ui-icon-circle-arrow-e',
        panX: 1,
        panY: 0,
        top: 1,
        left: 2
    }, {
        title: 'Pan Down',
        icon: 'ui-icon-circle-arrow-s',
        panX: 0,
        panY: 1,
        top: 2,
        left: 1
    }];
    var createButtons = function($img, $controls, itd){
        $.each(buttonsData, function(){
            var panProcId;
            var dx = this.panX * buttonsOpts.step, dy = this.panY * buttonsOpts.step;
            var $button = $('<div class="ui-state-default ui-corner-all" title="' + this.title + '"><span class="ui-icon ' + this.icon + '"/></div>');
            $controls.append($button);
            buttonsOpts.buttonWidth = $button.css({
                'position': 'absolute'
            }).width();
            buttonsOpts.buttonHeight = $button.height();
            $button.hover(function(){
                $(this).addClass('ui-state-hover').opacity(1);
            }, function(){
                $(this).removeClass('ui-state-hover').opacity(buttonsOpts.opacity);
            }).mouseup(function(){
                clearInterval(panProcId);
            }).mousedown(function(){
                panProcId = setInterval(function(){
                    $img.itMove(dx, dy, itd.callback);
                }, buttonsOpts.speed);
            }).css({
                'top': (this.top * buttonsOpts.buttonWidth) + 'px',
                'left': (this.left * buttonsOpts.buttonHeight) + 'px'
            }).opacity(buttonsOpts.opacity);
        });
        var $prefButton = $('<div class="ui-state-default ui-corner-all" title="Preferences"><span class="ui-icon ui-icon-wrench"/></div>');
        $controls.append($prefButton);
        $prefButton.hover(function(){
            if (!$(this).hasClass('ui-state-active')) {
                $(this).addClass('ui-state-hover').opacity(1);
            }
        }, function(){
            if (!$(this).hasClass('ui-state-active')) {
                $(this).removeClass('ui-state-hover').opacity(buttonsOpts.opacity);
            }
        }).css({
            'position': 'absolute',
            'top': buttonsOpts.buttonWidth + 'px',
            'left': buttonsOpts.buttonHeight + 'px'
        }).opacity(buttonsOpts.opacity);
        return $prefButton;
    };
    var createDialog = function($controls, $img, itd, $prefButton, $zoom){
        var $dialog = $('<div><form><ul>\
				<li><fieldset><legend>Offset</legend>\
				  <label for="itTop">Top</label><input id="itTop" name="itTop" type="text" size="5">\
				  <label for="itLeft">Left</label><input id="itLeft" name="itLeft" type="text" size="5">\
				</fieldset></li>\
				<li><fieldset><legend>Dimensions</legend>\
				  <label for="itWidth">Width</label><input id="itWidth" name="itWidth" type="text" size="5" >\
				  <label for="itHeight">Height</label><input id="itHeight" name="itHeight" type="text" size="5" >\
				  <label for="itZoom">Zoom</label><input id="itZoom" name="itZoom" type="text" size="5" >\
				</fieldset></li>\
				<li><span>Original Dimensions: <span id="itActWidth"></span> &times; <span id="itActHeight"></span></span></li>\
				</ul></form></div>');
        $dialog.find('#itActWidth').text(itd.actual.width);
        $dialog.find('#itActHeight').text(itd.actual.height);
        $dialog.find('span').css({
            fontSize: 'smaller'
        });
        $dialog.find('ul').css({
            listStyleType: 'none',
            margin: '0px',
            padding: '0px'
        });
        $dialog.find('fieldset').css({
            width: '95%',
            clear: 'both',
            display: 'block',
            'float': 'left'
        });
        $dialog.find('label').css({
            cursor: 'pointer',
            display: 'block',
            'float': 'left',
            fontWeight: 'bold',
            margin: '0 10px 0 0',
            width: '60px',
            textAlign: 'right'
        });
        $dialog.find('input').css({
            display: 'block',
            'float': 'left',
            margin: '0 5px',
            padding: '0px'
        });
        $controls.append($dialog);
        $('form input', $dialog).bind('blur.imagetool keydown.imagetool', function(e){
            if (e.type == 'keydown') {
                // check the key code depending on different browser implementations
                var /*int*/ key = (e.keyCode || e.which || e.charCode);
                // all browsers use the same code for the return key
                if (key != 13) {
                    return;
                }
            }
            var $field = $(this);
            switch ($field.attr('id')) {
                case 'itTop':
                    var top = parseInt($field.val());
                    if (isNaN(top)) {
                      break;
                    }
                    var y = top - itd.offset.top;
                    $img.itMove(0, y);
                    break;
                case 'itLeft':
                    var left = parseInt($field.val());
                    if (isNaN(left)) {
                      break;
                    }
                    var x = left - itd.offset.left;
                    $img.itMove(x, 0);
                    break;
                case 'itZoom':
                    var zoom = round($field.val(), 2);
                    if (isNaN(zoom)) {
                      break;
                    }
                    if (zoom == 0) {
                        zoom = 1;
                    }
                    $img.itResize(zoom);
                    break;
                case 'itWidth':
                    var width = parseInt($field.val());
                    if (isNaN(width)) {
                      break;
                    }
                    if (width < itd.viewport.width) {
                        width = itd.viewport.width;
                    }
                    var zoom2 = round(width / itd.actual.width, 2);
                    $img.itResize(zoom2);
                    break;
                case 'itHeight':
                    var height = parseInt($field.val());
                    if (isNaN(height)) {
                      break;
                    }
                    if (height < itd.viewport.height) {
                        height = itd.viewport.height;
                    }
                    var zoom2 = round(height / itd.actual.height, 2);
                    $img.itResize(zoom2);
                    break;
            };
            $('#itTop').val(itd.offset.top);
            $('#itLeft').val(itd.offset.left);
            $('#itZoom').val(itd.zoom);
            $zoom.slider('value', itd.zoom);
            $('#itWidth').val(itd.current.width);
            $('#itHeight').val(itd.current.height);
        });
        $dialog.dialog({
            autoOpen: false,
            title: 'Preferences',
            buttons: {
                'Ok': function(){
                    $dialog.dialog('close');
                    $prefButton.removeClass('ui-state-active').removeClass('ui-state-hover').opacity(buttonsOpts.opacity);
                },
            },
            width: 500
        });
        $dialog.parent('div.ui-dialog').find('a.ui-dialog-titlebar-close').click(function(){
            $prefButton.removeClass('ui-state-active').removeClass('ui-state-hover').opacity(buttonsOpts.opacity);
        });
        return $dialog;
    };
    
    var activatePrefButton = function($prefButton, $dialog, itd){
        $prefButton.click(function(){
            if ($(this).hasClass('ui-state-active')) {
                $dialog.dialog('close');
                $(this).removeClass('ui-state-active');
                return;
            }
            $('#itLeft').val(itd.offset.left);
            $('#itTop').val(itd.offset.top);
            $('#itWidth').val(itd.current.width);
            $('#itHeight').val(itd.current.height);
            $('#itZoom').val(itd.zoom);
            $(this).addClass('ui-state-active');
            $dialog.dialog('open');
        });
    };
    var createSlider = function($controls, $img, itd){
        var $zoom = $('<div class="zoom"></div>');
        $zoom.sliding = false;
        $controls.append($zoom);
        $zoom.slider({
            orientation: 'vertical',
            min: itd.zoomOpts.min,
            max: itd.zoomOpts.max,
            value: itd.zoom,
            step: 0.02,
            slide: function(event, ui){
                $img.itResize(ui.value, itd.callback);
            },
            change: function(event, ui){
                $zoom.sliding = true;
                //$img.itResize(ui.value, itd.callback);
                $zoom.sliding = false;
            },
            start: function(){
                $zoom.sliding = true;
            },
            stop: function(){
                $zoom.sliding = false;
            }
        }).hover(function(){
            $zoom.opacity(1);
        }, function(){
            $zoom.opacity(buttonsOpts.opacity);
        }).css({
            left: (buttonsOpts.buttonWidth * 1.5 - 5) + 'px',
            top: (buttonsOpts.buttonHeight * 4) + 'px',
            width: '10px',
            height: (itd.viewport.height - (buttonsOpts.buttonHeight * 5)) + 'px'
        }).opacity(buttonsOpts.opacity).children('.ui-slider-handle').append('<span class="ui-icon ui-icon-arrow-4-diag"/>').css({
            left: '-' + (buttonsOpts.buttonWidth / 2 - 5 + 1) + 'px', // why +1?
            height: buttonsOpts.buttonHeight + 'px',
            width: buttonsOpts.buttonWidth + 'px',
            marginBottom: '-' + (buttonsOpts.buttonHeight / 2) + 'px'
        });
        return $zoom;
    };
    
    var setupControls = function($img, itd){
        var $controls = $('<div id="itControls"></div>').css({
            height: '155px',
            left: '5px',
            position: 'absolute',
            top: '5px',
            width: '70px'
        });
        itd.controls = '#itControls';
        $img.after($controls);
        var $prefButton = createButtons($img, $controls, itd);
        var $zoom = createSlider($controls, $img, itd);
        var $dialog = createDialog($controls, $img, itd, $prefButton, $zoom);
        activatePrefButton($prefButton, $dialog, itd);
        // replace callback
        itd._callback = itd.callback;
        itd.callback = function(itData) {
            $('#itLeft').val(itData.offset.left);
            $('#itTop').val(itData.offset.top);
            $('#itWidth').val(itData.current.width);
            $('#itHeight').val(itData.current.height);
            $('#itZoom').val(itData.zoom);
            if (!$zoom.sliding) {
                $zoom.slider('value', itData.zoom);
            } 
	    if ($.isFunction(itd._callback)) {
	        itd._callback.call(this, itData);
	    }
        };
    };
    
    $.fn.itMove = function(dx, dy, callback){
        var x = parseInt(dx);
        var y = parseInt(dy);
        
        var $image = $(this);
        var itd = $image.data("itd");
        if (x + itd.offset.left < 0) {
            x = -itd.offset.left;
        }
        if (y + itd.offset.top < 0) {
            y = -itd.offset.top;
        }
        var vw = parseInt(itd.viewport.width / itd.zoom);
        if (x + itd.offset.left + vw > itd.actual.width) {
            x = itd.actual.width - vw - itd.offset.left;
        }
        var vh = parseInt(itd.viewport.height / itd.zoom);
        if (y + itd.offset.top + vh > itd.actual.height) {
            y = itd.actual.height - vh - itd.offset.top;
        }
        if ((x == 0) && (y == 0)) {
            return false;
        }
        if ((x + itd.offset.left < 0) || (y + itd.offset.top < 0)) {
            //console.log('what the hell?');
            if (x + itd.offset.left < 0) {
                x = -itd.offset.left;
            }
            if (y + itd.offset.top < 0) {
                y = -itd.offset.top;
            }
        }
        if (isNaN(x) || isNaN(y)) {
            //console.log('what the hell5?');
            return false;
        }
        itd.offset.left += x;
        itd.offset.top += y;
        
        x = -parseInt(itd.offset.left * itd.zoom);
        y = -parseInt(itd.offset.top * itd.zoom);
        $(this).css({
            left: x + "px",
            top: y + "px"
        });
        //console.log(JSON.stringify(itd));
        
        if ($.isFunction(callback)) {
            callback.call($image, itd);
        }
        return true;
    }
    $.fn.itResize = function(zoom, callback){
        var $image = $(this);
        var itd = $image.data("itd");
        zoom = round(zoom, 2);
        if (zoom == itd.zoom) {
            // nothing todo
            return false;
        }
        if (zoom > itd.zoomOpts.max) {
            zoom = itd.zoomOpts.max;
        }
        if (zoom < itd.zoomOpts.min) {
            zoom = itd.zoomOpts.min;
        }
        var newWidth = itd.actual.width * zoom;
        var newHeight = itd.actual.height * zoom;
        if (newWidth < itd.viewport.width) {
            zoom = itd.viewport.width / itd.actual.width;
            newHeight = itd.actual.height * zoom;
        }
        if (newHeight < itd.viewport.height) {
            zoom = itd.viewport.height / itd.actual.height;
            newWidth = itd.actual.width * zoom;
            if (newWidth < itd.viewport.width) {
                //console.log('what the hell?');
                return false;
            }
        }
        if ((zoom > itd.zoomOpts.max) || (zoom < itd.zoomOpts.min)) {
            //console.log('what the hell2?');
            return false;
        }
        zoom = round(zoom, 2);
        newWidth = parseInt(itd.actual.width * zoom);
        newHeight = parseInt(itd.actual.height * zoom);
        if ((newWidth < itd.viewport.width) || (newHeight < itd.viewport.height)) {
            //console.log('what the hell3?');
            return false;
        }
        if (isNaN(newWidth) || isNaN(newHeight) || isNaN(zoom)) {
            //console.log('what the hell6?');
            return false;
        }
        $image.css({
            width: newWidth + "px",
            height: newHeight + "px"
        });
        var oldZoom = itd.zoom;
        itd.current.width = newWidth;
        itd.current.height = newHeight;
        itd.zoom = zoom;
        // console.log(JSON.stringify(itd));
        
        if (oldZoom > 0) {
            var dx = parseInt((itd.viewport.width / oldZoom - itd.viewport.width / itd.zoom) / 2);
            var dy = parseInt((itd.viewport.height / oldZoom - itd.viewport.height / itd.zoom) / 2);
            $image.itMove(dx, dy, null);
        }
        if ($.isFunction(callback)) {
            callback.call($image, itd);
        }
        return true;
    };
    
    
    $.fn.imagetool = function(options){
    
        if ('destroy' == options) {
          return this.each(function(){
            var $image = $(this);
            var itd = $image.data("itd");
            if (!itd) {
              return;
            }
            // hide viewport
            $image.parent().opacity(0);
            
            // remove controls
            if (itd.controls) {
              $(itd.controls).remove();
            }
            
            // remove event handlers
            $(this).unbind(".imagetool"); 

            // set thumbnail original style
	    $image.css({
              width: itd.viewport.width + "px",
              height: itd.viewport.height + "px",
              left: 0,
              top: 0
            });

            // save changes
            // TODO: will remove additional classes
            $image.attr('class', JSON.stringify({'left': itd.offset.left, 'top': itd.offset.top, zoom: itd.zoom}));

	    // remove data
            $image.removeData("itd");
            // remove viewport and show image
            $image.unwrap();
            // need to load right thumbnail
          });
        }
    
        // build main options before element iteration
        var config = $.extend({}, $.fn.imagetool.defaults, options ||
        {});
        
        return this.each(function(){
            // hide the original image
            var $image = $(this).opacity(0);
            
            // build main options before element iteration
            var opts = $.extend({}, config , $image.metadata() || {});

            // create data
            var itd = new ImageToolData($image, opts);
            $image.data("itd", itd);
            
            // create viewport
            var viewportCss = {
                backgroundColor: "#ffffff",
                position: "relative",
                overflow: "hidden",
                width: itd.viewport.width + "px",
                height: itd.viewport.height + "px"
            };
            var $viewportElement = $('<div class="viewport"><\/div>');
            $viewportElement.css(viewportCss);
            $image.wrap($viewportElement);
            
            // loading sign
            if (config.loading) {
                $viewportElement = $image.parent();
                $viewportElement.css({
                    background: '#ffffff url(' + config.loading + ') no-repeat center center'
                });
            }
            
            $image.load(function(){
                // after original pic loaded
                // load it again but without size restrictions to get the real size
                var $imgCopy = $(new Image());
                $imgCopy.load(function(){
                    // real image size
                    itd.actual.width = this.width;
                    itd.actual.height = this.height;
                    // remove loading sign
                    if (config.loading) {
                        $viewportElement.css('background', '#ffffff none no-repeat center center');
                    }
                    // display image
                    $image.opacity(1);
                    $image.css({
                        position: "relative",
                        cursor: "move",
                        display: "block"
                    });
                    // setup
                    var zoom = itd.zoom;
                    var x = itd.offset.left, y = itd.offset.top;
                    itd.zoom = 0;
                    itd.offset.left = 0;
                    itd.offset.top = 0;
                    var changed = false;
                    changed = changed || $image.itResize(zoom, null);
                    changed = $image.itMove(x, y, null) || changed;
                    if (changed && $.isFunction(itd.callback)) {
                        itd.callback.call($image, itd);
                    }
                    $image.mousedown(handleMouseDown);
                    $image.bind("mouseup.imagetool mouseout.imagetool", function(){
                        $(this).unbind("mousemove.imagetool");
                        if (itd.controls) {
                            $(itd.controls).show();
                        }
                    });
                    if (config.showControls) {
                        setupControls($image, itd);
                    }
                }).attr('src', $image.attr('src'));
            });
            // be sure ie will also trigger the onload event
            if ($.browser.msie) {
                $image.attr("src", $image.attr("src") + '?' + (Math.round(2048 * Math.random())));
            }
        });
    };
    
    $.fn.imagetool.defaults = {
        allowZoom: true,
        allowPan: true,
        maxZoom: 3,
        minZoom: 0.1,
        left: -1,
        top: -1,
        zoom: 1,
        callback: null,
        showControls: false
    };
    
    $.fn.opacity = function(value){
        return $(this).css({
            '-khtml-opacity': value,
            '-moz-opacity': value,
            '-ms-filter': 'alpha(opacity=' + (value * 100) + ')',
            'filter': 'alpha(opacity=' + (value * 100) + ')',
            opacity: value
        });
    };

  $.fn.unwrap = function() {
    this.parent(':not(body)')
      .each(function(){
        $(this).replaceWith( this.childNodes );
      });
    
    return this;
  };
})(jQuery);
