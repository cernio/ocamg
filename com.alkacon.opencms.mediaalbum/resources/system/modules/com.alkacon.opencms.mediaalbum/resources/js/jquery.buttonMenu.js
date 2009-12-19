/**
 * <p>JQuery plugin to manage a simple menu with buttons.<br>
 *
 * The plugin itself acts as an interface for creating and interacting with menues and buttons.
 * For this you have always to specify an action</p>
 *
 * <p>Actions for menues:<br>
 * <dl>
 * <dt>create</dt>
 * <dd>Creates a new menu under the matched element(s).</dd>
 * <dt>destroy</dt>
 * <dd>Destroys a menu under the matched element(s).</dd>
 * <dt>paint</dt>
 * <dd>Paints the menu under the matched element(s) for the first time.</dd>
 * <dt>hide</dt>
 * <dd>Hides a menu under the matched element(s).</dd>
 * <dt>show</dt>
 * <dd>Shows a menu under the matched element(s).</dd>
 * <dt>enable</dt>
 * <dd>Enables a menu under the matched element(s).</dd>
 * <dt>disable</dt>
 * <dd>Disables a menu under the matched element(s).</dd>
 * <dt>add</dt>
 * <dd>Creates a new button in the menu under the matched element(s).</dd>
 * <dt>remove</dt>
 * <dd>Destroys a button in the menu under the matched element(s).</dd>
 * <dt>default</dt>
 * <dd>Sets a button as default in the menu under the matched element(s).</dd>
 * </dl></p>
 *
 * <p>Actions for buttons:<br>
 * <dl>
 * <dt>hide</dt>
 * <dd>Hides a menu under the matched element(s).</dd>
 * <dt>show</dt>
 * <dd>Shows a menu under the matched element(s).</dd>
 * <dt>enable</dt>
 * <dd>Enables a menu under the matched element(s).</dd>
 * <dt>disable</dt>
 * <dd>Disables a menu under the matched element(s).</dd>
 * </dl></p>
 *
 * @author Michael Moossen
 */
;
(function($){

    /**
     * The plugin itself acts as an interface for creating and interacting with menues and buttons.<p>
     *
     * @param {String} action the action to execute
     * @param {String} menuId the id of the menu to execute the action on
     * @param {String} buttonId the id of the button to execute the action on, optional if the action is a menu action
     * @param {AssocArray} options the options, depending on the action
     *
     * @return {JQuery} this, for chaining
     */
    $.fn.buttonMenu = /** {JQuery} */ function(/** {String} */ action, /** {String} */ menuId, /** {String} */ buttonId, /** {AssocArray} */ options) {
    
        if (typeof buttonId !== 'string') {
            // no button parameter
            options = buttonId;
            buttonId = '';
        } 
        
        // build options before element iteration
        var /** {AssocArray} */ menuOpts = $.extend({}, $.fn.buttonMenu.defaults['menu'], options ||
        {});
        var /** {AssocArray} */ buttonOpts = $.extend({}, $.fn.buttonMenu.defaults['button'], options ||
        {});
        
        return this.each(function(){
        
            // container
            var /** {JQuery} */ $cnt = $(this);
            
            switch (action) {
                case 'create':
                    create($cnt, menuId, menuOpts);
                    break;
                case 'destroy':
                    destroy($cnt, menuId, menuOpts);
                    break;
                default:
                    var /** {Menu} */ menu = getMenu($cnt, menuId);
					if (action == 'paint') {
						menu.paint($cnt);
					} else {
	                    menu.execute(action, buttonId, menuOpts, buttonOpts);
					}
            }
        });
    };
    
    /**
     * Represents a menu of buttons.<p>
     *
     * @param {String} paramId the menu id
     * @param {AssocArray} paramOpts the creation parameters
     */
    var Menu = function(/** {String} */paramId, /** {AssocArray} */ paramOpts) {
    
        // own properties
        /** {String} */
        this.id = paramId;
        /** {AssocMap} */
        this.options = paramOpts;
		/** {JQuery} */ 
		this.$this = null;
                
        // button management properties
        /** {String} */
        this.defaultButton = null;
        /** {Array<String>} */
        this.buttonArray = [];
        /** {AssocArray<String,Button>} */
        this.buttonMap = {};
        
        /**
         * Paints the menu on the given context.<p>
         *
         * @param {JQuery} $ctx the context to append the menu to
         *
         * @return {JQuery} the new painted menu
         * 
         * @see #destroy
         */
        this.paint = /** {JQuery} */ function(/** {JQuery} */ $ctx) {
        
            // create the markup
            var /** {JQuery} */ $menu = $("<div/>").addClass(this.options.menuClass).css(this.options.css).css(this.options.position);
            
            // append to the context
            $ctx.append($menu);
            
			// reference menu -> $menu
			this.$this = $ctx.find('div:last');
			// reference $menu -> menu
			this.$this.data("menu", this);
            
            // paint the buttons
            var /** {int} */ i, /** {int} */ size = this.buttonArray.length;
            for (i = 0; i < size; i++) {
                this.buttonMap[this.buttonArray[i]].paint(this);
            }
			// position the default button
			this.buttonMap[this.defaultButton].$this.prependTo($menu);
            
            // adjust size
            var /** {JQuery} */ $button = this.buttonMap[this.defaultButton].$this;
            var /** {AssocArray} */ cssCollapsed = {
				'top': this.$this.css('top') + 'px',
                'width': $button.outerWidth() + 'px',
                'height': $button.outerHeight() + 'px',
                'overflow': 'hidden'
            };
            this.$this.css(cssCollapsed);
            
			// initialize
            if (!this.options.visible) {
                this.hide();
            }
            if (!this.options.enabled) {
				this.disable(this.options);
			}            
			
			// expand on hover
            this.$this.hoverIntent({
				'over': function() {
		            var /** {JQuery} */ $menu = $(this);
					var /**{Menu}*/ menu = $menu.data("menu");
					if ($menu.hasClass(menu.options.disabledClass)) {
						return;
					}
					var /** {AssocArray} */ cssExpanded = {
						'width': 'auto',
						'height': 'auto',
						'overflow': 'auto'
					};
					if ((menu.options.orientation == 'down') || (menu.options.orientation == 'up')) {
						cssExpanded['width'] = cssCollapsed['width'];
					}
					$menu.css(cssExpanded);
					if (menu.options.orientation == 'up') {
						$menu.css('top', (Number(cssCollapsed['top'])) - $menu.outerHeight() + 'px');
					}
					// put default button in its right position
					if ((menu.options.orientation == 'left') || (menu.options.orientation == 'up')) {
						menu.buttonMap[menu.defaultButton].$this.appendTo($menu);
					}
				},
				'out': function(){
		            var /** {JQuery} */ $menu = $(this);
					var /**{Menu}*/ menu = $menu.data("menu");
					// put default button in its right position
					if ((menu.options.orientation == 'left') || (menu.options.orientation == 'up')) {
						menu.buttonMap[menu.defaultButton].$this.prependTo($menu);
					}
					$menu.css(cssCollapsed);
				},
				'interval': 600,
				'timeout': 50
			});
			// button focus action
			this.$this.delegate('mouseover','div', function() {
	            var /** {JQuery} */ $button = $(this);
				var /** {Button} */ button = $button.data('button');
    	        if (!$button.hasClass(button.options.activeClass) && !$button.hasClass(button.options.disabledClass)) {
        	        $button.addClass(button.options.hoverClass);
            	}
			});
			// button blur action
			this.$this.delegate('mouseout','div', function() {
	            var /** {JQuery} */ $button = $(this);
				var /** {Button} */ button = $button.data('button');
            	if (!$button.hasClass(button.options.activeClass) && !$button.hasClass(button.options.disabledClass)) {
                	$button.removeClass(button.options.hoverClass);
            	}
			});
			// button click action
			this.$this.delegate('click','div', function(ev) {
	            var /** {JQuery} */ $button = $(this);
				var /** {Button} */ button = $button.data('button');
				if ($button.hasClass(button.options.disabledClass)) {
					return;
				}
				var /** {Function} */ action = button.options.action;
				if ($.isFunction(action)) {
					action.apply(this, [ev]);
				}
			});
			return this.$this;
        };

        /**
         * Destroys/removes the whole menu and its buttons from the given context.<p>
         *
         * @see #paint
         */
        this.destroy = /** {void} */ function() {
        
            var /** {int} */ i, /** {int} */ size = this.buttonArray.length;
            for (i = size; i; i--) {
                this.removeButton(this.buttonArray[i]);
            }
			if (this.$this != null) {
	            this.$this.remove();
				this.$this = null;
			}
        };
        
        /**
         * Adds a button to this menu.<p>
         *
         * @param {String} buttonId the id of the button to create
         * @param {AssocArray} opts the creation options
         *
         * @return {Button} the new created button
         */
        this.addButton = /** {Button} */ function(/** {String} */ buttonId, /** {AssocArray} */ opts) {
        
            var /** {Button} */ button = this.buttonMap[buttonId];
            if (button) {
                // we do not allow button replacement
                return;
            }
            // create the button
            button = new Button(buttonId, opts);
            if (this.$this !== null) {
				button.paint(this, this.$this);
            }
            // keep track of it
            this.buttonMap[button.id] = button;
            if (!this.buttonArray.length) {
                this.defaultButton = buttonId;
            }
            this.buttonArray.push(button.id);
            return button;
        };
        
        /**
         * Removes a button from this menu.<p>
         *
         * @param {String} buttonId the id of the button to be removed
         *
         * @return {Button} the new created button
         */
        this.removeButton = /** {void} */ function(/** {String} */ buttonId) {
        
            var /** {Button} */ button = this.buttonMap[buttonId];
            if (!button) {
                // can not remove a non existent button
                return;
            }
            // keep track of it
            delete this.buttonMap[buttonId];
            this.buttonArray.splice(this.buttonArray.indexOf(buttonId), 1);
            if (!this.buttonArray.length) {
                defaultButton = false;
            }
            else {
                setDefault(this.buttonArray[0]);
            }
            // remove it
            button.destroy(this);
        };
        
        /**
         * Hides the menu.<p>
         *
         * @param {AssocArray} opts the hide options, optional
         */
        this.hide = /** {void} */ function(/** {AssocArray} */ opts) {
        
            if (opts) {
                this.$this.hide(opts.speed, opts.callback);
            }
            else {
                this.$this.hide();
            }
        };
        
        /**
         * Shows the menu.<p>
         *
         * @param {AssocArray} opts the hide options, optional
         */
        this.show = /** {void} */ function(/** {AssocArray} */ opts) {
        
            if (opts) {
                this.$this.show(opts.speed, opts.callback);
            }
            else {
                this.$this.show();
            }
        };
        
        /**
         * Disables the menu.<p>
         *
         * @param {AssocArray} opts the disable options, optional
         */
        this.disable = /** {void} */ function(/** {AssocArray} */ opts) {
        
            this.$this.addClass(this.options.disabledClass);
            // disable the default button
            var /** {Button} */ defButton = this.buttonMap[this.defaultButton];
			if (!defButton.disabled) {
				defButton.$this.addClass(defButton.options.disabledClass);
				if (opts && opts.reason) {
					defButton.oldReason = defButton.$this.attr('title');
					defButton.$this.attr('title', opts.reason);
				}
			}
        };
        
        /**
         * Enables the menu.<p>
         *
         * @param {AssocArray} opts the enable options, optional
         */
        this.enable = /** {void} */ function(/** {AssocArray} */ opts) {
        
            this.$this.removeClass(this.options.disabledClass);
            // enable the default button
            var /** {Button} */ button = this.buttonMap[this.defaultButton];
			if (!button.disabled) {
				button.$this.removeClass(this.options.disabledClass);
				if (button.oldReason) {
					button.$this.attr('title', button.oldReason);
					delete button.oldReason;
				}
			}
        };
        
        /**
         * Sets the given button as default.<p>
         *
         * @param {String} buttonId the id of the button to be set as default
         */
        this.setDefault = function(/** {String} */ buttonId) {
        
            var /** {Button} */ button = this.buttonMap[buttonId];
            if (!button) {
                // can not set to default a non existent button
                return;
            }
            if (this.defaultButton === buttonId) {
                // this button is already the default
                return;
            }
            var /** {int} */ pos;
            if (this.defaultButton !== this.buttonArray[0]) {
                // move the old default button to its original position
                pos = this.buttonArray.indexOf(this.defaultButton);
                this.buttonMap[this.defaultButton].$this.insertAfter(this.buttonMap[this.buttonArray[pos - 1]].$this);
            }
            //keep track of it
            this.defaultButton = buttonId;
			if ((this.options.orientation == 'down') || (this.options.orientation == 'right')) {
	            // move the new default button to the first position
	            button.$this.prependTo(this.$this);
			} else {
	            // move the new default button to the last position
	            button.$this.appendTo(this.$this);
			} 
            button.show();
        };
        
        /**
         * Executes the given action on this menu.<p>
         *
         * @param {String} action the action to execute
         * @param {String} buttonId the id of the button to be used
         * @param {AssocArray} menuOpts the options, optional
         * @param {AssocArray} buttonOpts the options, optional
         */
        this.execute = function(action, buttonId, menuOpts, buttonOpts) {
        
            switch (action) {
                case 'add':
                    this.addButton(buttonId, buttonOpts);
                    break;
                case 'remove':
                    this.removeButton(buttonId);
                    break;
                case 'default':
                    this.setDefault(buttonId);
                    break;
                default:
                    if (!buttonId) {
                        switch (action) {
                            case 'hide':
                                this.hide(menuOpts);
                                break;
                            case 'show':
                                this.show(menuOpts);
                                break;
                            case 'disable':
                                this.disable(menuOpts);
                                break;
                            case 'enable':
                                this.enable(menuOpts);
                                break;
                            default:
                                alert('not supported action: ' + action);
                        }
                    }
                    else {
                        var /** {Button} */ button = this.buttonMap[buttonId];
                        button.execute(action, buttonOpts);
                    }
            }
        }
    };
    
    /**
     * Represents a menu button.<p>
     *
     * @param {String} paramId the button id
     * @param {AssocArray} paramOpts the creation parameters
     */
    var Button = function(/** {String} */paramId, /** {AssocArray} */ paramOpts) {
		
		/** {String} */
        this.id = paramId;
		/** {AssocArray} */
        this.options = paramOpts;
		/** {boolean} */
		this.hidden = false;
		/** {boolean} */
		this.disabled = false;
		/** {JQuery} */ 
		this.$this = null;
                
        /**
         * Paints the button on the given menu.<p>
         *
	     * @param {Menu} menu the menu
         *
         * @return {JQuery} the new painted button
         * 
         * @see #destroy
         */
        this.paint = /** {JQuery} */ function(/** {Menu} */ menu) {
        
			// create the markup
            var /** {JQuery} */ $button = $('<div/>')
												.addClass(this.options.buttonClass)
												.attr('title', this.options.name)
												.append($('<span/>')
												.addClass(this.options.iconClass)
												.addClass(this.options.icon));
			if (menu.options.orientation == 'down' || menu.options.orientation == 'right') {
				menu.$this.prepend($button);
				// reference button -> $button
				this.$this = menu.$this.find('div:first');
			} else {
				menu.$this.append($button);
				// reference button -> $button
				this.$this = menu.$this.find('div:last');
			}
			// reference $button -> button
			this.$this.data('button', this);
			
			// initialize
            if (!this.options.visible) {
                this.hide();
            }
            if (!this.options.enabled) {
				this.disable(this.options);
			}
			return this.$this;
        };
        
        /**
         * Destroys/removes the button from the given menu.<p>
         *
         * @see #paint
         */
        this.destroy = /** {void} */ function() {
        
			if (this.$this != null) {
	            this.$this.remove();
			}
        }
        
        /**
         * Hides the button.<p>
         *
         * @param {AssocArray} opts the hide options, optional
         */
        this.hide = /** {void} */ function(/** {AssocArray} */ opts) {
        
            if (opts) {
                this.$this.hide(opts.speed, opts.callback);
            }
            else {
                this.$this.hide();
            }
			this.hidden = true;
        };
        
        /**
         * Shows the button.<p>
         *
         * @param {AssocArray} opts the hide options, optional
         */
        this.show = /** {void} */ function(/** {AssocArray} */ opts) {
        
            if (opts) {
                this.$this.show(opts.speed, opts.callback);
            }
            else {
                this.$this.show();
            }
			this.hidden = false;
        };
        
        /**
         * Disables the button.<p>
         *
         * @param {AssocArray} opts the disable options, optional
         */
        this.disable = /** {void} */ function(/** {AssocArray} */ opts) {
        
            this.$this.addClass(this.options.disabledClass);
			if (opts && opts.reason) {
				this.$this.attr('title', opts.reason);
			}
			this.disabled = true;
        };
        
        /**
         * Enables the button.<p>
         *
         * @param {AssocArray} opts the enable options, optional
         */
        this.enable = /** {void} */ function(/** {AssocArray} */ opts) {
        
            this.$this.removeClass(this.options.disabledClass);
			this.$this.attr('title', this.options.name);
			this.disabled = false;
        };
        
        /**
         * Executes the given action on this button.<p>
         *
         * @param {String} action the action to execute
         * @param {AssocArray} opts the options, optional
         */
        this.execute = /** {void} */ function(/** {String} */ action, /** {AssocArray} */ opts) {
        
            switch (action) {
                case 'hide':
                    this.hide(opts);
                    break;
                case 'show':
                    this.show(opts);
                    break;
                case 'disable':
                    this.disable(opts);
                    break;
                case 'enable':
                    this.enable(opts);
                    break;
                default:
                    alert('not supported action: ' + action);
            }
        }
    };
    
	/**
	 * Returns the menu data for the given menu container.<p>
	 * 
	 * @param {JQuery} $cnt the menu container
	 * 
	 * @return {AssocArray}the menu data
	 */
    var getData = /** {AssocArray} */ function(/** {JQuery} */ $cnt) {
		
        var /** {AssocArray} */ data = $cnt.data("menues");
        if (!data) {
            data = {};
            $cnt.data("menues", data);
        }
        return data;
    };
    
	/**
	 * Returns the menu identified by the given id.<p>
	 * 
	 * @param {JQuery} $cnt the menu container
	 * @param {String} menuId the menu id
	 * 
	 * @return {Menu} the menu
	 */
    var getMenu = /** {Menu} */ function(/** {JQuery} */ $cnt, /** {String} */ menuId) {
		
        return getData($cnt)[menuId];
    };
    
	/**
	 * Creates anew menu for the given container.<p>
	 * 
	 * @param {JQuery} $cnt the container
	 * @param {String} menuId the id of the menu to create
	 * @param {AssocArray} options the menu creation options
	 */
    var create = /** {void} */ function(/** {JQuery} */ $cnt, /** {String} */ menuId, /** {AssocArray} */ options) {
		
        var /** {Menu} */ menu = getMenu($cnt, menuId);
        if (menu) {
            return;
        }
        menu = new Menu(menuId, options);
        getData($cnt)[menuId] = menu;
    };
    
	/**
	 * Destroys the menu identified by the given id.<p>
	 * 
	 * @param {JQuery} $cnt the menu container
	 * @param {String} menuId the menu id
	 */
    var destroy = /** {void} */ function(/** {JQuery} */ $cnt, /** {String} */ menuId) {
		
        var /** {Menu} */ menu = getMenu($cnt, menuId);
        if (!menu) {
            return;
        }
        menu.destroy();
        delete getData($cnt)[menu.id];
        if (getData($cnt) ===
        {}) {
            $cnt.removeData("menues");
        }
    };
    
	/**
	 * Default settings for each action.<p>
	 */
    $.fn.buttonMenu.defaults = {
		menu: {
			'menuClass': 'menu',
	        'disabledClass': 'ui-state-disabled',
	        'hoverClass': 'ui-state-hover',
			'visible': true,
			'enabled': true
		},
		button: {
			'buttonClass': 'button ui-state-default ui-corner-all',
	        'disabledClass': 'ui-state-disabled',
	        'activeClass': 'ui-state-active',
	        'hoverClass': 'ui-state-hover',
	        'iconClass': 'ui-icon',
			'visible': true,
			'enabled': true
		}
    };
    
	/**
	 * Jquery plugin for setting the opacity.<p>
	 * 
	 * @param {float} value the opacity to set, between 0 and 1
	 * 
	 * @return {JQuery} this, for chaining
	 */
    $.fn.opacity = /** {JQuery} */ function(/** {float} */ value) {
		
        return $(this).css({
            '-khtml-opacity': value,
            '-moz-opacity': value,
            '-ms-filter': 'alpha(opacity=' + (value * 100) + ')',
            'filter': 'alpha(opacity=' + (value * 100) + ')',
            'opacity': value
        });
    };
})(jQuery);
