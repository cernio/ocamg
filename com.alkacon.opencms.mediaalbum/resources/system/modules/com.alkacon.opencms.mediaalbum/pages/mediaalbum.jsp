<%@ page session="false" import="com.alkacon.opencms.mediaalbum.CmsMediaAlbumBean, org.opencms.workplace.*, org.opencms.file.*, java.util.*" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%
	CmsMediaAlbumBean cms = new CmsMediaAlbumBean(pageContext, request, response);
	pageContext.setAttribute("cms", cms);
%>
<cms:include property="template" element="head" />

<c:set var="currentPage"><c:out value="${param.page}" default="1"/></c:set>
<script type="text/javascript">
$(document).ready(function() {
  ocamg.init({
    needsPagination: ${cms.needsPagination},
    prevText: 'prev', //<fmt:message key="mediaalbum.pagination.prev" />',
    nextText: 'next', //<fmt:message key="mediaalbum.pagination.next" />',
    imageCount: ${cms.imageCount},
    itemsPerPage: ${cms.itemsPerPage},
    currentPage: ${currentPage},
    albumPageURI: '${cms:vfs(pageContext).link['%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/albumpage.jsp:d71347e0-af6b-11de-8531-e30a09549264)']}',
    albumURI: '${cms:vfs(pageContext).requestContext.uri}',
    serverURI: '${cms:vfs(pageContext).link['%(link:/system/modules/com.alkacon.opencms.mediaalbum/elements/ajax.jsp:600ae89d-bbd1-11de-bc19-e30a09549264)']}',
    editableTooltip: 'Click here to edit the title' //<fmt:message key="mediaalbum.editable.tooltip" />'
  });
});
</script>

<div class="view-article">
<cms:contentload collector="singleFile" param="%(opencms.uri)">
	<cms:contentaccess var="album" />
        <h2><c:out value="${album.value['Title']}" /></h2>

	<%-- Pagination above top text --%>
	<c:if test="${cms.configuration['pagination.top'] == 'above' && cms.needsPagination}">
		<div class="pagination_container" style="text-align: ${cms.configuration['pagination.align']};">
			<div id="Pagination" class="album-pagination"></div>
		</div>
	</c:if>
	
	<%-- Description --%>
	<c:if test="${!album.value['Description'].isEmptyOrWhitespaceOnly}">
	    <p><c:out value="${album.value['Description']}" escapeXml="false"/></p>
	</c:if>	

	<%-- Pagination below Description --%>
	<c:if test="${cms.configuration['pagination.top'] == 'below' && cms.needsPagination}">
		<div class="pagination_container" style="text-align: ${cms.configuration['pagination.align']};">
			<div id="Pagination" class="album-pagination"></div>
		</div>
	</c:if>

	<div id="album_pages" class='${cms.albumInfo}'>
		<div id="album_page_${currentPage}">
			<%-- Show the images in the given vfs path --%>
			<cms:include file="../elements/albumpage.jsp">
				<cms:param name="album" value="${cms:vfs(pageContext).requestContext.uri}" />
				<cms:param name="page" value="${currentPage}" />
			</cms:include>
		</div>
	</div>

	<div class="album_clear"></div>

	<%-- Pagination above footer text --%>
	<c:if test="${cms.configuration['pagination.bottom'] == 'above' && cms.needsPagination}">
		<div class="pagination_container" style="text-align: ${cms.configuration['pagination.align']};">
			<div id="Pagination" class="album-pagination"></div>
		</div>
	</c:if>

	<%-- Footer Text --%>
	<c:if test="${!album.value['FooterText'].isEmptyOrWhitespaceOnly}">
		<div style="clear: left;"><c:out value="${album.value['FooterText']}" escapeXml="false"/></div>
	</c:if>
	
	<%-- Pagination below Footer Text--%>
	<c:if test="${cms.configuration['pagination.bottom'] == 'below' && cms.needsPagination}">
		<div class="pagination_container" style="text-align: ${cms.configuration['pagination.align']};">
			<div id="Pagination" class="album-pagination"></div>
		</div>
	</c:if>
	
</cms:contentload>
</div> <%-- Article --%>

<cms:include property="template" element="foot" />