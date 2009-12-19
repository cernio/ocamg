<%@ page session="false" import="org.opencms.jsp.*" %><%
	boolean online = new CmsJspActionElement(pageContext, request, response).getRequestContext().currentProject().isOnlineProject();
%>
var ocamg = {
  lastPage: 0,
  needsPagination: false,
  prevText: 'next',
  nextText: 'prev',
  imageCount: 0,
  itemsPerPage: 1,
  currentPage: 1,
  albumPageURI: '%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/albumpage.jsp:d71347e0-af6b-11de-8531-e30a09549264)',
  albumURI: 'none',
  serverURI: '%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/ajax.jsp:600ae89d-bbd1-11de-bc19-e30a09549264)',
  editableTooltip: 'Click here to edit the text',
  pageselectCallback: function(page_id, jq) {
	ocamg.loadAlbumPage(page_id+1);
	return false;
  },
  loadAlbumPage: function(page) {
	ocamg.lastPage = ocamg.currentPage;
	ocamg.currentPage = page;
	if ( $('#album_page_' + page).length == 0 ) {
		$('<div/>').load(ocamg.albumPageURI, {
			album: ocamg.albumURI,
			page: page
		}, ocamg.onPageLoad).attr('id', 'album_page_' + page).css({'display': 'none'}).appendTo('#album_pages');
	} else {
		ocamg.switchPage();
	}
  },
  onPageLoad: function() {
<% if (online) { %>
      //TODO: update the fancybox's click handler
       $('#album_page_' + ocamg.currentPage + ' a.fancymedia').fancybox({'overlayShow': true, 'hideOnContentClick': true });
<% } else { %>
       ocamg.editMode();
<% } %>
    ocamg.switchPage();
  },
<% if (!online) { %>
  editMode: function() {
      //TODO: install the fancybox's click handler
	$('#album_page_' + ocamg.currentPage + ' div.image-title').each(function() {
	  var $title = $(this);
	  var $parent = $title.parents('div.album_box');
	  var albumData = $('#album_pages').metadata(); 
	  albumData = $.extend({}, albumData, {'action': 'settitle', 'image': $parent.metadata().image});
	  $title
	    .css('cursor', 'pointer')
	    .text($.trim($title.text()))
	    .editable(ocamg.serverURI, { 'event': 'click', 'method': 'POST', 'type': 'text', 'tooltip': ocamg.editableTooltip, 'style': 'inherit', 'select': 'true', 'placeholder': '&nbsp;&nbsp;&nbsp;&nbsp;', 'onblur': 'submit', 'name': 'data', 'submitdata': albumData});

	  $parent.find('div.image-thumbnail').append('<div class="thumbButton"\/>');
	  var $button = $parent.find('div.thumbButton').addClass('thumbEdit');
	  $button.bind('click.thumbnail', function() {
	    var $button = $(this);
	    var $parent = $button.parents('div.album_box');
	    if ($button.hasClass('thumbEdit')) {
              $button.removeClass('thumbEdit');
              $button.addClass('thumbSave');
              $('div.thumbEdit').hide();
              
              var opts = $parent.find('img').metadata();
              opts.showControls = true;
	      $parent.find('img').each(function() {
		    var $img = $(this);
		    var $a = $img.parents('a');
		    $img.attr('src', $a.attr('href'));
		    //TODO: additionally remove the fancybox's click handler
		    $a.bind('click.thumbnail', function(e) { 
		      e.preventDefault(); 
		      e.stopImmediatePropagation();
		      return false; 
		    });
	      }).imagetool(opts);
	    } else if ($button.hasClass('thumbSave')) {
              var $img = $parent.find('img');
              $img.opacity(0);
              $img.imagetool('destroy');
              var loader = $img.parent('div.image-thumbnail');
              loader.addClass('loading');
              $img.removeData($.metadata.defaults.single);
	      var albumData = $('#album_pages').metadata(); 
	      albumData = $.extend({}, albumData, {'action': 'setthumbinfo', 'image': $parent.metadata().image, 'data':JSON.stringify($img.metadata())});
              $.post(ocamg.serverURI, albumData, function(data) {
                var $imgCopy = $(new Image());
                $imgCopy.load(function(){
                  $img.attr('src', data.result);
                  $img.opacity(1);
                  loader.removeClass('loading');
                }).attr('src', data.result);
              }, "json");
              
              var $a = $img.parents('a');
              $a.unbind('click.thumbnail');
              //TODO: reinstall the fancybox's click handler
              $button.removeClass('thumbSave');
              $button.addClass('thumbEdit');
              $('div.thumbEdit').show();
	    }
	  });
	});
  },
<% } %>
  afterFadeOut: function() {
	$('#album_page_' + ocamg.lastPage).hide();
	$('#album_page_' + ocamg.currentPage).
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
	$('#album_page_' + ocamg.lastPage).animate({opacity: '0'}, 'slow', null, ocamg.afterFadeOut);
  },
  init: function(options) {
        $.extend(ocamg, options);
	$(".image-thumbnail").decorate();
        if (ocamg.needsPagination) {
		// Create pagination element
		$("#Pagination").pagination(ocamg.imageCount, {
			num_edge_entries: 2,
			num_display_entries: 8,
			prev_text: ocamg.prevText,
			next_text: ocamg.nextText,
			items_per_page: ocamg.itemsPerPage,
			callback: ocamg.pageselectCallback
	        });
        }
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
