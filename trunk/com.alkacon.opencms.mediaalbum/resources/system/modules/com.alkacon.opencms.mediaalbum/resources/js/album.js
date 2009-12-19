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
  pageselectCallback: function(page_id, jq) {
	ocamg.loadAlbumPage(page_id+1);
	return false;
  },
  loadAlbumPage: function(page) {
	ocamg.data.lastPage = ocamg.data.currentPage;
	ocamg.data.currentPage = page;
	if ( $('#album_page_' + page).length == 0 ) {
		$('<div/>').load(ocamg.data.albumPageURI, {
			album: ocamg.data.albumURI,
			page: page
		}, ocamg.onPageLoad).attr('id', 'album_page_' + page).css({'display': 'none'}).appendTo('#album_pages');
	} else {
		ocamg.switchPage();
	}
  },
  onPageLoad: function() {
<% if (online) { %>
      //TODO: update the fancybox's click handler
       $('#album_page_' + ocamg.data.currentPage + ' a.fancymedia').fancybox({'overlayShow': true, 'hideOnContentClick': true });
<% } else { %>
       ocamg.editMode();
<% } %>
    ocamg.switchPage();
  },
<% if (!online) { %>
  editMode: function() {
      //TODO: install the fancybox's click handler
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
                //TODO: additionally remove the fancybox's click handler
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
              //TODO: reinstall the fancybox's click handler
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
  afterFadeOut: function() {
	$('#album_page_' + ocamg.data.lastPage).hide();
	$('#album_page_' + ocamg.data.currentPage).
	  css('opacity', '0').
	  show().
	  find(".image-thumbnail").
	    decorate().
	  end().
	  animate({opacity: '1'}, 'slow', null, function() {
            // $('#album_page_' + currentPage + ' a.fancymedia').imageHover();
          });
  },
  switchPage: function() {
	$('#album_page_' + ocamg.data.lastPage).animate({opacity: '0'}, 'slow', null, ocamg.afterFadeOut);
  },
  init: function(options) {
    $.extend(ocamg.data, options);
    $.fn.buttonMenu.defaults.button.iconClass = 'icon';
    $(".image-thumbnail").decorate();
    if (ocamg.data.needsPagination) {
      // Create pagination element
      $("#Pagination").pagination(ocamg.data.imageCount, {
        num_edge_entries: 2,
        num_display_entries: 8,
        prev_text: ocamg.data.prevText,
        next_text: ocamg.data.nextText,
        items_per_page: ocamg.data.itemsPerPage,
        callback: ocamg.pageselectCallback
      });
    }
    ocamg.onPageLoad();
  }
};

$.fn.decorate = function() {
        return this.each(function() {
		var $this = $(this);
		var data = $this.metadata();
		$this.find('img').picFrame(data.frame);
		$this.parent('div').css('transform', 'rotate(' + data.rotation + 'deg)');
	});
};
