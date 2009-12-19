You can use this file to replace the picture album of template two by a ocamg.
just replace /demo_en/view/flowerparade.html

then you need just to include all css and js in the template by adding these lines to
/system/modules/org.opencms.frontend.templatetwo/templates/main.jsp
in the header before the <editable/> tag.

---
<% // if current resource is an ocamg
if (cms.getCmsObject().readResource(cms.getRequestContext().getUri()).getTypeId() == 260062) {
  CmsOptimizationCss css = new CmsOptimizationCss(pageContext, request, response);
  css.includeDefault("%(link.strong:/system/modules/com.alkacon.opencms.mediaalbum/resources/all.css:f4ca365f-ebe3-11de-b3ac-e30a09549264)");
  CmsOptimizationJs js = new CmsOptimizationJs(pageContext, request, response);
  js.includeOptimized("%(link.strong:/system/modules/com.alkacon.opencms.mediaalbum/resources/all.js:1c12ab8b-ebe4-11de-b3ac-e30a09549264)");
  js.includeDefault("%(link.strong:/system/modules/com.alkacon.opencms.mediaalbum/resources/dev.js)");
}
%>
---
