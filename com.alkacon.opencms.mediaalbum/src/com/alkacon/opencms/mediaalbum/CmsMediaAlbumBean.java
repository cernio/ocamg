/*
 * File   : $Source: /usr/local/cvs/alkacon/com.alkacon.opencms.mediaalbum/src/com/alkacon/opencms/mediaalbum/CmsMediaAlbumBean.java,v $
 * Date   : $Date: 2008-06-18 10:56:23 $
 * Version: $Revision: 1.3 $
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * For further information about OpenCms, please see the
 * project website: http://www.opencms.org
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

package com.alkacon.opencms.mediaalbum;

import org.opencms.file.CmsFile;
import org.opencms.file.CmsObject;
import org.opencms.file.CmsResource;
import org.opencms.file.CmsResourceFilter;
import org.opencms.file.types.CmsResourceTypeImage;
import org.opencms.flex.CmsFlexController;
import org.opencms.i18n.CmsEncoder;
import org.opencms.i18n.CmsLocaleManager;
import org.opencms.json.JSONException;
import org.opencms.json.JSONObject;
import org.opencms.jsp.CmsJspActionElement;
import org.opencms.loader.CmsImageScaler;
import org.opencms.main.CmsException;
import org.opencms.main.CmsLog;
import org.opencms.util.CmsRequestUtil;
import org.opencms.util.CmsStringUtil;
import org.opencms.util.CmsUUID;
import org.opencms.xml.CmsXmlUtils;
import org.opencms.xml.content.CmsXmlContent;
import org.opencms.xml.content.CmsXmlContentFactory;
import org.opencms.xml.types.I_CmsXmlContentValue;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.jsp.PageContext;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.logging.Log;

/**
 * Contains helper functions to show the media album.<p>
 * 
 * @author Michael Moossen
 * 
 * @version $Revision: 1.3 $
 * 
 * @since 7.6
 */
public class CmsMediaAlbumBean extends CmsJspActionElement {

    /** Request parameter action value constants. */
    protected enum Action {
        /** Sets a thumbnail's info. */
        SETTHUMBINFO,
        /** Sets a thumbnail's title. */
        SETTITLE;
    }

    /** Json property name constants for the request data. */
    protected enum JsonData {

        /** Image left position. */
        LEFT("left"),
        /** Image top position. */
        TOP("top"),
        /** Image zoom level. */
        ZOOM("zoom");

        /** Property name. */
        private String m_name;

        /** 
         * Constructor.<p> 
         * 
         * @param name the name
         */
        private JsonData(final String name) {

            m_name = name;
        }

        /** 
         * Returns the name.<p>
         * 
         * @return the name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Json property name constants for responses. */
    protected enum JsonResponse {

        /** The error message. */
        ERROR("error"),
        /** The result. */
        RESULT("result"),
        /** The response state. */
        STATE("state");

        /** Property name. */
        private String m_name;

        /** 
         * Constructor.<p> 
         * 
         * @param name the name
         */
        private JsonResponse(final String name) {

            m_name = name;
        }

        /** 
         * Returns the name.<p>
         * 
         * @return the name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Json property name constants for response status. */
    protected enum JsonState {

        /** An error occurred. */
        ERROR("error"),
        /** The request was executed with any problems. */
        OK("ok");

        /** Property name. */
        private String m_name;

        /** 
         * Constructor.<p> 
         * 
         * @param name the name
         */
        private JsonState(final String name) {

            m_name = name;
        }

        /** 
         * Returns the name.<p>
         * 
         * @return the name
         */
        public String getName() {

            return m_name;
        }
    }

    /**
     * Configuration key constants.<p>
     */
    private enum Configuration {

        /** page.items node name.*/
        ITEMS_PER_PAGE("page.items"),
        /** image.maxsize node name.*/
        MAX_IMAGE_SIZE("image.maxsize");

        /** The node name. */
        private String m_name;

        /**
         * Constructor.<p>
         * 
         * @param name the node name
         */
        private Configuration(final String name) {

            m_name = name;
        }

        /**
         * Returns the node name.<p>
         * 
         * @return the node name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Enum for request parameter name constants. */
    private enum ReqParam {
        /** The action to execute.*/
        ACTION("action"),
        /** The media album URI.*/
        ALBUM("album"),
        /** The data.*/
        DATA("data"),
        /** The image URI.*/
        IMAGE("image"),
        /** The current locale.*/
        LOCALE("locale");

        /** The node name. */
        private String m_name;

        /**
         * Constructor.<p>
         * 
         * @param name the node name
         */
        private ReqParam(final String name) {

            m_name = name;
        }

        /**
         * Returns the node name.<p>
         * 
         * @return the node name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Enum for XML node name constants. */
    private enum XmlNode {
        /** Configuration node name.*/
        CONFIGURATION("Configuration"),
        /** DetailPage node name.*/
        DETAILPAGE("DetailPage"),
        /** File node name.*/
        FILE("File"),
        /** Files node name.*/
        FILES("Files"),
        /** Thumbnail node name.*/
        THUMBNAIL("Thumbnail"),
        /** Thumbnails node name.*/
        THUMBNAILS("Thumbnails"),
        /** VfsFolder node name.*/
        VFSFOLDER("VfsFolder");

        /** The node name. */
        private String m_name;

        /**
         * Constructor.<p>
         * 
         * @param name the node name
         */
        private XmlNode(final String name) {

            m_name = name;
        }

        /**
         * Returns the node name.<p>
         * 
         * @return the node name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Mime type constant. */
    public static final String MIMETYPE_APPLICATION_JSON = "application/json";

    /** The log object for this class. */
    private static final Log LOG = CmsLog.getLog(CmsMediaAlbumBean.class);

    /**
     * Maybe navigation info can be passed as request parameter.<p>
     * 
     * @param args not used
     * 
     * @throws UnsupportedEncodingException if something goes wrong
     */
    public static void main(final String[] args) throws UnsupportedEncodingException {

        final CmsUUID id = new CmsUUID();
        System.out.println(id);
        final String enc = new String(
            Base64.encodeBase64(id.toString().getBytes(CmsEncoder.ENCODING_UTF_8)),
            CmsEncoder.ENCODING_UTF_8);
        System.out.println(enc);
        System.out.println(CmsEncoder.encodeParameter(enc));
        final String dec = new String(
            Base64.decodeBase64(enc.getBytes(CmsEncoder.ENCODING_UTF_8)),
            CmsEncoder.ENCODING_UTF_8);
        System.out.println(dec);
        final String enc2 = new String(Base64.encodeBase64(id.toByteArray()), CmsEncoder.ENCODING_UTF_8);
        System.out.println(enc2);
        System.out.println(CmsEncoder.encode(enc2));
        final CmsUUID dec2 = new CmsUUID(Base64.decodeBase64(enc2.getBytes(CmsEncoder.ENCODING_UTF_8)));
        System.out.println(dec2.toString());
    }

    /** The configuration map. */
    Map<String, String> m_config;

    /** The image scaler to check if a down scale is required. */
    CmsImageScaler m_maxSizeImageScaler;

    /** Lazy map to check if down scale is required for a given image.*/
    private Map<CmsResource, Boolean> m_downscaleRequired;

    /** The list of resources to display.*/
    private List<CmsResource> m_images;

    /** The raw items. */
    private List<CmsResource> m_rawImages;

    /** Thumbnail info for the given resource. */
    private Map<CmsResource, CmsMediaAlbumThumbnail> m_thumbnailInfo;

    /** The current album xml content. */
    private CmsXmlContent m_xmlContent;

    /**
     * Empty constructor, required for every JavaBean.
     */
    public CmsMediaAlbumBean() {

        super();
    }

    /**
     * Constructor, with parameters.
     * 
     * @param context the JSP page context object
     * @param req the JSP request 
     * @param res the JSP response 
     */
    public CmsMediaAlbumBean(final PageContext context, final HttpServletRequest req, final HttpServletResponse res) {

        super();
        init(context, req, res);
    }

    /**
     * Returns the needed info for communicating back.<p>
     * 
     * @return the needed info for communicating back
     * 
     * @throws JSONException if something goes wrong
     * @throws CmsException if something goes wrong
     */
    public JSONObject getAlbumInfo() throws JSONException, CmsException {

        final JSONObject info = new JSONObject();
        info.put("album", getXmlContent().getFile().getStructureId().toString());
        info.put("locale", getCmsObject().getRequestContext().getLocale());
        return info;
    }

    /**
     * Returns the album path.<p>
     * 
     * @return the media album path
     */
    public String getAlbumPath() {

        final String albumParam = getRequest().getParameter(ReqParam.ALBUM.getName());
        if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(albumParam)) {
            try {
                final CmsUUID id = new CmsUUID(albumParam);
                return getCmsObject().getSitePath(getCmsObject().readResource(id));
            } catch (final Throwable e) {
                return albumParam;
            }
        }
        return getRequestContext().getUri();
    }

    /**
     * Returns the configuration map.<p>
     * 
     * @return the configuration map
     * 
     * @throws CmsException if something goes wrong
     */
    public Map<String, String> getConfiguration() throws CmsException {

        if (m_config == null) {
            m_config = CmsStringUtil.splitAsMap(
                "pagination.align:right|pagination.top:below|pagination.bottom:above|image.maxsize:none|page.items:all",
                "|",
                ":");
            m_config.putAll(CmsStringUtil.splitAsMap(getXmlValue(CmsXmlUtils.concatXpath(
                XmlNode.CONFIGURATION.getName(),
                XmlNode.DETAILPAGE.getName())), "|", ":"));
        }
        return m_config;
    }

    /**
     * Returns the number of resources in this album.<p>
     * 
     * @return the number of resources in this album
     * 
     * @throws CmsException if something goes wrong
     */
    public int getImageCount() throws CmsException {

        return getRawImages().size();
    }

    /**
     * Returns the list of resources in this album.<p> 
     * 
     * @return the list of resources in this album
     * 
     * @throws CmsException if something goes wrong
     */
    public List<CmsResource> getImages() throws CmsException {

        if (m_images == null) {

            List<CmsResource> images = new ArrayList<CmsResource>();
            final CmsObject cms = getCmsObject();
            try {
                images = getRawImages();
            } catch (final CmsException ex) {
                CmsMediaAlbumBean.LOG.error(ex.getLocalizedMessage(), ex);
            }
            final CmsXmlContent xmlContent = getXmlContent();
            final String defThumbPath = CmsXmlUtils.concatXpath(
                XmlNode.CONFIGURATION.getName(),
                XmlNode.THUMBNAILS.getName());
            final Locale locale = cms.getRequestContext().getLocale();
            final String defConfiguration = xmlContent.getValue(defThumbPath, locale).getStringValue(cms);

            m_images = new ArrayList<CmsResource>(images.size());
            m_thumbnailInfo = new HashMap<CmsResource, CmsMediaAlbumThumbnail>(images.size());

            final List<I_CmsXmlContentValue> broken = new ArrayList<I_CmsXmlContentValue>();
            final List<I_CmsXmlContentValue> files = xmlContent.getValues(XmlNode.FILES.getName(), locale);
            for (final I_CmsXmlContentValue file : files) {
                try {
                    final String imagePath = getXmlValue(CmsXmlUtils.concatXpath(file.getPath(), XmlNode.FILE.getName()));
                    final CmsResource image = cms.readResource(imagePath);
                    if (!images.contains(image)) {
                        broken.add(file);
                        continue;
                    }
                    images.remove(image);
                    final String xpath = CmsXmlUtils.concatXpath(file.getPath(), XmlNode.THUMBNAIL.getName());
                    final I_CmsXmlContentValue thumbnail = xmlContent.getValue(xpath, locale);
                    m_thumbnailInfo.put(
                        image,
                        new CmsMediaAlbumThumbnail(cms, image, thumbnail, defConfiguration, this));
                    m_images.add(image);
                } catch (final Throwable t) {
                    CmsMediaAlbumBean.LOG.error(t.getLocalizedMessage(), t);
                    broken.add(file);
                }
            }
            for (final I_CmsXmlContentValue brokenFile : broken) {
                // remove broken entries
                xmlContent.removeValue(brokenFile.getPath(), locale, brokenFile.getIndex());
            }
            int i = xmlContent.getIndexCount(XmlNode.FILES.getName(), locale);
            for (final CmsResource image : images) {
                try {
                    // fill the xml with the missing information
                    final I_CmsXmlContentValue file = xmlContent.addValue(cms, XmlNode.FILES.getName(), locale, i);
                    xmlContent.getValue(CmsXmlUtils.concatXpath(file.getPath(), XmlNode.FILE.getName()), locale).setStringValue(
                        cms,
                        cms.getSitePath(image));
                    // create thumb info
                    final CmsMediaAlbumThumbnail thumbInfo = new CmsMediaAlbumThumbnail(
                        cms,
                        image,
                        null,
                        defConfiguration,
                        this);
                    m_thumbnailInfo.put(image, thumbInfo);
                    // increase index
                    i++;
                } catch (final Throwable t) {
                    CmsMediaAlbumBean.LOG.error(t.getLocalizedMessage(), t);
                }
            }
            if (!images.isEmpty() || !broken.isEmpty()) {
                // save changes
                try {
                    saveChanges();
                } catch (final Throwable t) {
                    CmsMediaAlbumBean.LOG.error(t.getLocalizedMessage(), t);
                }
            }
            m_images.addAll(images);
        }
        return m_images;
    }

    /**
     * Returns a lazy initialized map that checks if downscaling is required
     * for the given resource used as a key in the Map.<p> 
     * 
     * @return a lazy initialized map
     */
    public Map<CmsResource, Boolean> getIsDownscaleRequired() {

        if (m_downscaleRequired == null) {
            m_downscaleRequired = LazyMap.decorate(new HashMap<CmsResource, Boolean>(), new Transformer() {

                /**
                 * @see org.apache.commons.collections.Transformer#transform(java.lang.Object)
                 */
                public Object transform(final Object input) {

                    CmsImageScaler maxSizeImageScaler;
                    try {
                        maxSizeImageScaler = getMaxSizeImageScaler();
                    } catch (final CmsException e) {
                        CmsMediaAlbumBean.LOG.error(e.getLocalizedMessage(), e);
                        return Boolean.FALSE;
                    }
                    if (!maxSizeImageScaler.isValid()) {
                        return Boolean.FALSE;
                    }
                    final CmsImageScaler scaler = new CmsImageScaler(getCmsObject(), (CmsResource)input);
                    return Boolean.valueOf(scaler.isDownScaleRequired(maxSizeImageScaler));
                }
            });
        }
        return m_downscaleRequired;
    }

    /**
     * Returns the number of items per page to be used.<p>
     * 
     * @return the number of items per page
     * 
     * @throws CmsException if something goes wrong
     */
    public int getItemsPerPage() throws CmsException {

        final String cfg = getConfiguration().get(Configuration.ITEMS_PER_PAGE.getName());
        int itemsPerPage;
        try {
            itemsPerPage = Integer.parseInt(cfg);
        } catch (final Exception e) {
            itemsPerPage = getImageCount();
        }
        return itemsPerPage;
    }

    /**
     * Returns the max size image scaler.<p>
     * 
     * @return the max size image scaler
     * 
     * @throws CmsException if something goes wrong
     */
    public CmsImageScaler getMaxSizeImageScaler() throws CmsException {

        if (m_maxSizeImageScaler == null) {
            m_maxSizeImageScaler = new CmsImageScaler();
            final String imgSize = getConfiguration().get(Configuration.MAX_IMAGE_SIZE.getName());
            if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(imgSize) && imgSize.contains("x")) {
                final String[] values = imgSize.split("x");
                try {
                    m_maxSizeImageScaler.setWidth(Integer.parseInt(values[0]));
                    m_maxSizeImageScaler.setHeight(Integer.parseInt(values[1]));
                    m_maxSizeImageScaler.setQuality(80);
                    m_maxSizeImageScaler.setRenderMode(3);
                } catch (final NumberFormatException ex) {
                    CmsMediaAlbumBean.LOG.error(ex.getLocalizedMessage(), ex);
                }
            }
        }
        return m_maxSizeImageScaler;
    }

    /**
     * Returns the thumbnail info for the given resource.<p>
     * 
     * @return the thumbnail info for the given resource
     * 
     * @throws CmsException if something goes wrong
     */
    public Map<CmsResource, CmsMediaAlbumThumbnail> getThumbnailInfo() throws CmsException {

        if (m_thumbnailInfo == null) {
            getImages();
        }
        return m_thumbnailInfo;
    }

    /**
     * Returns the current album's xml content.<p>
     * 
     * @return the current album's xml content
     * 
     * @throws CmsException if something goes wrong
     */
    public CmsXmlContent getXmlContent() throws CmsException {

        if (m_xmlContent == null) {
            final CmsObject cms = getCmsObject();
            final CmsFile file = cms.readFile(getAlbumPath());
            m_xmlContent = CmsXmlContentFactory.unmarshal(cms, file);
        }
        return m_xmlContent;
    }

    /**
     * Returns the XML string value for the given path.<p>
     * 
     * @param path the path to get the value for
     * 
     * @return the XML string value for the given path
     * 
     * @throws CmsException if something goes wrong
     */
    public String getXmlValue(final String path) throws CmsException {

        final CmsXmlContent xmlcontent = getXmlContent();
        final CmsObject cms = getCmsObject();
        return xmlcontent.getValue(path, cms.getRequestContext().getLocale()).getStringValue(cms);
    }

    /**
     * Checks if the given image need to be down scaled.<p>
     * 
     * @param image the given image to check
     * 
     * @return <code>true</code> if the given image need to be down scaled
     */
    public boolean isDownscaleRequired(final CmsResource image) {

        return (getIsDownscaleRequired().get(image)).booleanValue();
    }

    /**
     * Checks if we need pagination.<p>
     * 
     * @return <code>true</code> if we need pagination
     * 
     * @throws CmsException if something does wrong
     */
    public boolean isNeedsPagination() throws CmsException {

        return getItemsPerPage() < getImageCount();
    }

    // TODO: add methods for handling dates

    /**
     * Saves the given thumbnail information.<p>
     * 
     * @param thumbInfo the thumbnail information to save
     * 
     * @throws CmsException if something goes wrong
     */
    public void saveThumbnailInfo(final CmsMediaAlbumThumbnail thumbInfo) throws CmsException {

        final CmsXmlContent content = getXmlContent();
        final CmsObject cms = getCmsObject();
        final Locale locale = cms.getRequestContext().getLocale();
        // try to find the original thumb info
        final List<I_CmsXmlContentValue> files = content.getValues(XmlNode.FILES.getName(), locale);
        I_CmsXmlContentValue origFile = null;
        for (final I_CmsXmlContentValue file : files) {
            final String imagePath = getXmlValue(CmsXmlUtils.concatXpath(file.getPath(), XmlNode.FILE.getName()));
            if (imagePath.equals(cms.getSitePath(thumbInfo.getImage()))) {
                // found
                origFile = file;
                break;
            }
        }
        if (origFile == null) {
            // not found, create one at the end
            final int i = content.getIndexCount(XmlNode.FILES.getName(), locale);
            origFile = content.addValue(cms, XmlNode.FILES.getName(), locale, i);
            content.getValue(CmsXmlUtils.concatXpath(origFile.getPath(), XmlNode.FILE.getName()), locale).setStringValue(
                cms,
                cms.getSitePath(thumbInfo.getImage()));
        }

        // get the thumb info
        final String thumbPath = CmsXmlUtils.concatXpath(origFile.getPath(), XmlNode.THUMBNAIL.getName());
        I_CmsXmlContentValue origThumb = content.getValue(thumbPath, locale);
        if (origThumb == null) {
            // create it if missing
            origThumb = content.addValue(cms, thumbPath, locale, 0);
        }
        // update thumb info
        updateThumbInfo(origThumb.getPath(), thumbInfo);

        // save changes
        saveChanges();
    }

    /**
     * Main method that handles all requests.<p>
     * 
     * @throws IOException if there is any problem while writing the result to the response 
     * @throws JSONException if there is any problem with JSON
     */
    public void serve() throws JSONException, IOException {

        // set the mime type to application/json
        final CmsFlexController controller = CmsFlexController.getController(getRequest());
        controller.getTopResponse().setContentType(CmsMediaAlbumBean.MIMETYPE_APPLICATION_JSON);

        JSONObject result = new JSONObject();
        try {
            result = executeAction();
        } catch (final Exception e) {
            // a serious error occurred, should not...
            result.put(JsonResponse.ERROR.getName(), e.getLocalizedMessage() == null ? "NPE" : e.getLocalizedMessage());
            CmsMediaAlbumBean.LOG.error(Messages.get().getBundle().key(
                Messages.ERR_SERVER_EXCEPTION_1,
                CmsRequestUtil.appendParameters(
                    getRequest().getRequestURL().toString(),
                    CmsRequestUtil.createParameterMap(getRequest().getQueryString()),
                    false)), e);
        }
        // add state info
        if (result.has(JsonResponse.ERROR.getName())) {
            // add state=error in case an error occurred 
            result.put(JsonResponse.STATE.getName(), JsonState.ERROR.getName());
        } else if (!result.has(JsonResponse.STATE.getName())) {
            // add state=ok i case no error occurred
            result.put(JsonResponse.STATE.getName(), JsonState.OK.getName());
        }
        // write the result
        result.write(getResponse().getWriter());
    }

    /**
     * Checks whether a list of parameters are present as attributes of a request.<p>
     * 
     * If this isn't the case, an error message is written to the JSON result object.
     * 
     * @param request the request which contains the parameters
     * @param result the JSON object which the error message should be written into, can be <code>null</code>
     * @param params the array of parameters which should be checked
     * 
     * @return true if and only if all parameters are present in the request
     * 
     * @throws JSONException if something goes wrong with JSON
     */
    protected boolean checkParameters(
        final HttpServletRequest request,
        final JSONObject result,
        final ReqParam... params) throws JSONException {

        for (final ReqParam param : params) {
            final String value = request.getParameter(param.getName());
            if (value == null) {
                result.put(JsonResponse.ERROR.getName(), Messages.get().getBundle().key(
                    Messages.ERR_JSON_MISSING_PARAMETER_1,
                    param.getName()));
                return false;
            }
        }
        return true;
    }

    /**
     * Handles all requests.<p>
     * 
     * @return the result
     * 
     * @throws JSONException if there is any problem with JSON
     * @throws CmsException if there is a problem with the cms context
     */
    protected JSONObject executeAction() throws JSONException, CmsException {

        final JSONObject result = new JSONObject();
        final HttpServletRequest request = getRequest();
        if (!checkParameters(request, result, ReqParam.ACTION, ReqParam.LOCALE, ReqParam.ALBUM)) {
            return result;
        }
        final String actionParam = request.getParameter(ReqParam.ACTION.getName());
        final Action action = Action.valueOf(actionParam.toUpperCase());
        final String localeParam = request.getParameter(ReqParam.LOCALE.getName());

        final CmsObject cms = getCmsObject();
        cms.getRequestContext().setLocale(CmsLocaleManager.getLocale(localeParam));
        if (action.equals(Action.SETTITLE)) {
            // save the title
            if (!checkParameters(request, result, ReqParam.IMAGE, ReqParam.DATA)) {
                return result;
            }
            final String imageParam = request.getParameter(ReqParam.IMAGE.getName());
            final String dataParam = request.getParameter(ReqParam.DATA.getName());

            final CmsResource resource = cms.readResource(new CmsUUID(imageParam));
            final CmsMediaAlbumThumbnail thumbInfo = getThumbnailInfo().get(resource);
            final String title = dataParam == null ? "" : dataParam;
            thumbInfo.setTitle(title);
            saveThumbnailInfo(thumbInfo);
            result.put(JsonResponse.RESULT.getName(), title);
        } else if (action.equals(Action.SETTHUMBINFO)) {
            // save thumbnail information
            if (!checkParameters(request, result, ReqParam.IMAGE, ReqParam.DATA)) {
                return result;
            }
            final String imageParam = request.getParameter(ReqParam.IMAGE.getName());
            final String dataParam = request.getParameter(ReqParam.DATA.getName());

            final CmsResource resource = cms.readResource(new CmsUUID(imageParam));
            final CmsMediaAlbumThumbnail thumbInfo = getThumbnailInfo().get(resource);

            final JSONObject data = new JSONObject(dataParam);
            thumbInfo.setThumbPosition(
                data.getInt(JsonData.LEFT.getName()),
                data.getInt(JsonData.TOP.getName()),
                (float)data.getDouble(JsonData.ZOOM.getName()));
            saveThumbnailInfo(thumbInfo);
            result.put(JsonResponse.RESULT.getName(), link(thumbInfo.getThumbnailPath() + thumbInfo.getThumbParam()));
        } else {
            result.put(JsonResponse.ERROR.getName(), Messages.get().getBundle().key(
                Messages.ERR_JSON_WRONG_PARAMETER_VALUE_2,
                ReqParam.ACTION.getName(),
                actionParam));
        }
        return result;
    }

    /**
     * Returns the list of raw resources in the current media album.<p>
     * 
     * @return the list of raw resources
     * 
     * @throws CmsException if something goes wrong
     */
    protected List<CmsResource> getRawImages() throws CmsException {

        if (m_rawImages == null) {
            m_rawImages = getCmsObject().readResources(
                getXmlValue(XmlNode.VFSFOLDER.getName()),
                CmsResourceFilter.DEFAULT.addRequireType(CmsResourceTypeImage.getStaticTypeId()),
                true);
        }
        return m_rawImages;
    }

    /**
     * Saves the modified XML content to VFS.<p>
     * 
     * @throws CmsException if something goes wrong
     */
    protected void saveChanges() throws CmsException {

        final CmsXmlContent content = getXmlContent();
        final CmsObject cms = getCmsObject();

        final CmsFile file = cms.readFile(getAlbumPath());
        file.setContents(content.marshal());
        cms.lockResource(cms.getSitePath(file));
        cms.writeFile(file);
        cms.unlockResource(cms.getSitePath(file));
    }

    /**
     * Updates the underlying XML content with the given thumbnail information.<p>
     * 
     * @param path the thumbnail path in the XML content
     * @param thumbInfo the thumbnail information
     * 
     * @throws CmsException if something goes wrong
     */
    protected void updateThumbInfo(final String path, final CmsMediaAlbumThumbnail thumbInfo) throws CmsException {

        final CmsXmlContent content = getXmlContent();
        final CmsObject cms = getCmsObject();
        final Locale locale = cms.getRequestContext().getLocale();

        content.getValue(CmsXmlUtils.concatXpath(path, CmsMediaAlbumThumbnail.XmlNode.TITLE.getName()), locale).setStringValue(
            cms,
            thumbInfo.getTitle());
        content.getValue(CmsXmlUtils.concatXpath(path, CmsMediaAlbumThumbnail.XmlNode.CONFIGURATION.getName()), locale).setStringValue(
            cms,
            thumbInfo.getConfiguration());
        content.getValue(CmsXmlUtils.concatXpath(path, CmsMediaAlbumThumbnail.XmlNode.THUMBNAILURI.getName()), locale).setStringValue(
            cms,
            cms.getSitePath(thumbInfo.getThumbnail()));
    }
}
