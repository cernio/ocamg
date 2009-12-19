<%@ page session="false" import="com.alkacon.opencms.mediaalbum.*" %><%
	CmsMediaAlbumBean jsp = new CmsMediaAlbumBean(pageContext, request, response);
	jsp.serve();
%>