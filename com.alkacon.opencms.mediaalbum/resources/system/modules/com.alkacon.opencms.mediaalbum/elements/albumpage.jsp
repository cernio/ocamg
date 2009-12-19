<%@ page session="false" import="com.alkacon.opencms.mediaalbum.CmsMediaAlbumBean" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%
	CmsMediaAlbumBean cms = new CmsMediaAlbumBean(pageContext, request, response);
	pageContext.setAttribute("cms", cms);
%>
<c:set var="itemsPerPage" value="${cms.itemsPerPage}" />
<c:set var="start" value="${((param.page-1) * itemsPerPage) + 1}" />
<c:set var="end" value="${param.page * itemsPerPage}" />

<c:forEach items="${cms.images}" var="image" varStatus="status">

	<c:set var="thumb" value="${cms.thumbnailInfo[image]}" />
	
	<c:choose>
		<c:when test="${start le status.count && end ge status.count}">
			<div style="background-color: ${thumb.background}; " class="album_box {image: '${thumb.thumbnail.structureId}'}">
				<div class="image-thumbnail {frame:'${thumb.frame}', rotation: ${thumb.rotation}}">
					<a href="<cms:link>${thumb.imagePath}${thumb.downScaleParam}</cms:link>" title="${thumb.title}" class="fancymedia" rel="page${param.page}" >
						<img class='${thumb.thumbInfo}' alt="${thumb.title}" width="150" height="150" src="<cms:link>${thumb.thumbnailPath}${thumb.thumbParam}</cms:link>"/>
					</a>
				</div>
				
				<%-- Title of the image --%>
				<c:set var="className" value="title-${thumb.showTitle}" />
				<c:if test="${thumb.showTitle == 'hide'}">
					<c:set var="className" value="" />
				</c:if>
				<div class="image-title ${className}">
					<c:if test="${thumb.showTitle != 'hide'}">
						<c:set var="title" value="${thumb.title}" />
						<c:if test="${empty title}">
							<c:set var="title" value="&nbsp;" />
						</c:if>
						<c:out value="${title}" escapeXml="false" />
					</c:if>
				</div>
			</div>
		</c:when>
		<c:otherwise>
			<a href="<cms:link>${thumb.imagePath}${thumb.downScaleParam}</cms:link>" title="${thumb.title}" class="fancymedia" rel="page${param.page}" style="display: none;" ></a>
		</c:otherwise>
	</c:choose>
</c:forEach>