<%@ page session="false" import="org.opencms.jsp.*" %><%
	boolean online = new CmsJspActionElement(pageContext, request, response).getRequestContext().currentProject().isOnlineProject();
%>
var ocamg = {
  data: {
    lastPage: 0,
    needsPagination: false,
    prevText: 'next',
    nextText: 'prev',
    imageCount: 0,
    itemsPerPage: 1,
    currentPage: 1,
    albumPageURI: '%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/albumpage.jsp:d71347e0-af6b-11de-8531-e30a09549264)',
    albumURI: '',
    serverURI: '%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/ajax.jsp:600ae89d-bbd1-11de-bc19-e30a09549264)',
    editableTooltip: 'Click here to edit the title'
  },
  loadAlbumPage: function(page, fn) {
	ocamg.data.lastPage = ocamg.data.currentPage;
	ocamg.data.currentPage = page;
	if ( $('#album_page_' + page).find('div.album_box').length == 0 ) {
		$('#album_page_' + page).load(ocamg.data.albumPageURI, {
			album: ocamg.data.albumURI,
			page: page
		}, function(){ ocamg.switchPage(fn); }).css({'display': 'none'});
	} else {
		ocamg.switchPage(fn);
	}
  },
<% if (!online) { %>
  editMode: function() {
	$('#album_page_' + ocamg.data.currentPage + ' div.image-title').each(function() {
      // make the title editable
	  var $title = $(this);
	  var $parent = $title.parents('div.album_box');
	  var albumData = $('#album_pages').metadata(); 
	  albumData = $.extend({}, albumData, {'action': 'settitle', 'image': $parent.metadata().image});
	  $title
	    .css('cursor', 'pointer')
	    .text($.trim($title.text()))
	    .editable(ocamg.data.serverURI, { 'event': 'click', 'method': 'POST', 'type': 'text', 'tooltip': ocamg.data.editableTooltip, 'style': 'inherit', 'select': 'true', 'placeholder': '&nbsp;&nbsp;&nbsp;&nbsp;', 'onblur': 'submit', 'name': 'data', 'submitdata': albumData});
      // create the button menu
	  var $menuCnt = $parent.find('div.image-thumbnail');
	  $menuCnt.eq(0).buttonMenu('create', 'main', {
          orientation: 'left',
          position: {
              top: '10px',
              right: '10px'
          }
      });
	  // create the edit button
	  $menuCnt.buttonMenu('add', 'main', 'direct-edit', {
          name: 'Direct Edit',
          icon: 'icon-direct-edit',
          action: function(){
              // hide all
		      $menuCnt.buttonMenu('hide', 'main');
              // show only this save button
		      var $parent = $(this).parents('div.image-thumbnail'); 
              $parent.buttonMenu('hide', 'main', 'direct-edit').buttonMenu('hide', 'main', 'properties').buttonMenu('default', 'main', 'save').buttonMenu('show', 'main');
              // execute action
              var opts = $parent.find('img').metadata();
              opts.showControls = true;
              $parent.find('img').each(function() {
                var $img = $(this);
                var $a = $img.parents('a');
                $img.attr('src', $a.attr('href'));
              }).imagetool(opts);
          }
      });
	  // create the save button
	  $menuCnt.buttonMenu('add', 'main', 'save', {
          name: 'Save',
          icon: 'icon-save',
          action: function(){
              // show again edit button
              var $parent = $(this).parents('div.image-thumbnail'); 
              $parent.buttonMenu('hide', 'main').buttonMenu('hide', 'main', 'save').buttonMenu('default', 'main', 'direct-edit').buttonMenu('show', 'main', 'properties');
              // show all
              $menuCnt.buttonMenu('show', 'main');
              // execute action
              var $img = $parent.find('img');
              $img.opacity(0);
              $img.imagetool('destroy');
              var loader = $img.parent('div.image-thumbnail');
              loader.addClass('loading');
              $img.removeData($.metadata.defaults.single);
              var albumData = $('#album_pages').metadata(); 
              albumData = $.extend({}, albumData, {'action': 'setthumbinfo', 'image': $parent.metadata().image, 'data':JSON.stringify($img.metadata())});
              $.post(ocamg.data.serverURI, albumData, function(response) {
                var $imgCopy = $(new Image());
                $imgCopy.load(function(){
                  $img.attr('src', response.result);
                  $img.opacity(1);
                  loader.removeClass('loading');
                }).attr('src', response.result);
              }, "json");
          },
          visible: false
      });
	  // create the properties button
      $menuCnt.buttonMenu('add', 'main', 'properties', {
          name: 'Properties',
          icon: 'icon-properties',
          action: function(){
              // TODO: properties dialog
              alert('properties');
          }
      });
      $menuCnt.buttonMenu('paint', 'main');
	});
  },
<% } %>
  switchPage: function(fn) {
    var last = ocamg.data.lastPage, current = ocamg.data.currentPage;
    <% if (!online) { %>ocamg.editMode();<% } %>
    $('#album_page_' + last).animate({opacity: '0'}, { duration:'slow', complete: function() {
      $('#album_page_' + last).hide();
      $('#album_page_' + current).
        css('opacity', '0').
        show().
        find(".image-thumbnail").
          each(ocamg.decorate).
        end().
        animate({opacity: '1'}, {duration:'slow', complete: function() {
          if ($.isFunction(fn)) {
            fn();
          }
        }});
   }});
  },
  decorate: function() {
    var $this = $(this);
    var data = $this.metadata();
    $this.find('img').picFrame(data.frame);
    $this.parent('div').css('transform', 'rotate(' + data.rotation + 'deg)');
  },
  init: function(options) {
    $.extend(ocamg.data, options);
	if (window.location.hash.indexOf('#page') === 0) {
		// use the hash to select the page
		var page = parseInt(window.location.hash.substring(5));
		ocamg.data.currentPage = page;
		if (isNaN(page) || (page < 1)) {
			page = 1;
		} else if (ocamg.data.needsPagination) {
			var lastPage = ocamg.data.imageCount/ocamg.data.itemsPerPage;
			if (lastPage != parseInt(lastPage)) {
				lastPage = parseInt(1 + lastPage);
			}
			if (page > lastPage) {
				page = lastPage;
			}
		}
		if (ocamg.data.currentPage != page) {
			ocamg.data.currentPage = page;
            window.location.hash='#page'+ocamg.data.currentPage;
		}
	}
    $.fn.buttonMenu.defaults.button.iconClass = 'icon';
    $(".image-thumbnail").each(ocamg.decorate);
    if (ocamg.data.needsPagination) {
      // Create pagination element
      $("#Pagination").pagination(ocamg.data.imageCount, {
        num_edge_entries: 2,
        num_display_entries: 8,
        prev_text: ocamg.data.prevText,
        next_text: ocamg.data.nextText,
        items_per_page: ocamg.data.itemsPerPage,
        current_page: ocamg.data.currentPage - 1,
        callback: function(page_id, jq, fn) {
    	  ocamg.loadAlbumPage(page_id+1,fn);
          window.location.hash='#page'+ocamg.data.currentPage;
          return false;
        }
      });
    }
    // install fancy box
    $('#album_pages a.fancybox').fancybox({'overlayShow': true, 'hideOnContentClick': true });    
    // load the initial page
    ocamg.loadAlbumPage(ocamg.data.currentPage);
  }
};