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

import org.opencms.file.CmsObject;
import org.opencms.file.CmsPropertyDefinition;
import org.opencms.file.CmsResource;
import org.opencms.json.JSONException;
import org.opencms.json.JSONObject;
import org.opencms.loader.CmsImageScaler;
import org.opencms.main.CmsException;
import org.opencms.main.CmsLog;
import org.opencms.util.CmsStringUtil;
import org.opencms.xml.CmsXmlUtils;
import org.opencms.xml.types.I_CmsXmlContentValue;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;

/**
 * Media album thumbnail information bean.<p>
 * 
 * @author Michael Moossen
 * 
 * @version $Revision: 1.3 $
 * 
 * @since 7.6
 */
public class CmsMediaAlbumThumbnail {

    /**
     * Crop option name constants.<p>
     */
    protected enum CropOption {

        /** CropHeight configuration option name.*/
        H,
        /** CropWidth configuration option name.*/
        W,
        /** CropLeft configuration option name.*/
        X,
        /** CROPTOP configuration option name.*/
        Y;
    }

    /** Enum for frames name constants. */
    protected enum Frame {
        /** Black frame name.*/
        BLACK_FRAME("black-frame"),
        /** cut-corners frame name.*/
        CUT_CORNERS("cut-corner"),
        /** Gold frame name.*/
        GOLD_FRAME("gold-frame"),
        /** Stamp frame name.*/
        STAMP("stamp");

        /** The frame name. */
        private String m_name;

        /**
         * Constructor.<p>
         * 
         * @param name the frame name
         */
        private Frame(final String name) {

            m_name = name;
        }

        /**
         * Returns the frame name.<p>
         * 
         * @return the frame name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Enum for configuration options name constants. */
    protected enum Option {
        /** Background configuration option name.*/
        BACKGROUND("background"),
        /** Crop configuration option name.*/
        CROP("crop"),
        /** Filter configuration option name.*/
        FILTER("filter"),
        /** Frame configuration option name.*/
        FRAME("frame"),
        /** Height configuration option name.*/
        HEIGHT("height"),
        /** Quality configuration option name.*/
        QUALITY("quality"),
        /** RenderMode configuration option name.*/
        RENDERMODE("mode"),
        /** Rotation configuration option name.*/
        ROTATION("rotation"),
        /** Title configuration option name.*/
        TITLE("title"),
        /** Width configuration option name.*/
        WIDTH("width");

        /** The configuration option name. */
        private String m_name;

        /**
         * Constructor.<p>
         * 
         * @param name the configuration option name
         */
        private Option(final String name) {

            m_name = name;
        }

        /**
         * Returns the configuration option name.<p>
         * 
         * @return the configuration option name
         */
        public String getName() {

            return m_name;
        }
    }

    /** Enum for XML node name constants. */
    protected enum XmlNode {
        /** Configuration node name.*/
        CONFIGURATION("Configuration"),
        /** ThumbnailUri node name.*/
        THUMBNAILURI("ThumbnailUri"),
        /** Title node name.*/
        TITLE("Title");

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

    /** The log object for this class. */
    private static final Log LOG = CmsLog.getLog(CmsMediaAlbumThumbnail.class);

    /** The configuration map. */
    private final Map<String, String> m_configuration;

    /** Computed crop height. */
    private int m_cropHeight;

    /** Computed crop left. */
    private int m_cropLeft;

    /** Computed crop left. */
    private int m_cropTop;

    /** Computed crop width. */
    private int m_cropWidth;

    /** The down scale parameter. */
    private final String m_downScaleParam;

    /** The frame name. */
    private String m_frame;

    /** The original height. */
    private final int m_oriHeight;

    /** The original width.*/
    private final int m_oriWidth;

    /** The resource. */
    private final CmsResource m_resource;

    /** The resource path. */
    private final String m_resourcePath;

    /** The rotation. */
    private int m_rotation;

    /** The scaler. */
    private final CmsImageScaler m_scaler;

    /** The thumbnail resource. */
    private CmsResource m_thumbnail;

    /** The thumbnail path. */
    private final String m_thumbnailPath;

    /** The thumbnail parameter. */
    private String m_thumbParam;

    /** The title. */
    private String m_title;

    /** The zoom level. */
    private float m_zoom;

    /**
     * Constructor.<p>
     * 
     * @param cms the cms context
     * @param resource the resource
     * @param thumbnailInfo the thumbnail information
     * @param defaultConfiguration the default configuration string
     * @param album the album
     * 
     * @throws CmsException if something goes wrong
     */
    public CmsMediaAlbumThumbnail(
        final CmsObject cms,
        final CmsResource resource,
        final I_CmsXmlContentValue thumbnailInfo,
        final String defaultConfiguration,
        final CmsMediaAlbumBean album)
    throws CmsException {

        m_resource = resource;

        // set the title
        m_title = getThumbnailInfo(cms, thumbnailInfo, XmlNode.TITLE.getName());
        if (CmsStringUtil.isEmptyOrWhitespaceOnly(m_title)) {
            m_title = cms.readPropertyObject(m_resource, CmsPropertyDefinition.PROPERTY_TITLE, false).getValue(
                m_resource.getName());
        }

        // read and unmarshall the configuration string
        m_configuration = CmsStringUtil.splitAsMap(defaultConfiguration, "|", ":");
        final String configuration = getThumbnailInfo(cms, thumbnailInfo, XmlNode.CONFIGURATION.getName());
        if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(configuration)) {
            m_configuration.putAll(CmsStringUtil.splitAsMap(configuration, "|", ":"));
        }

        // set the frame
        m_frame = m_configuration.get(Option.FRAME.getName());
        if (m_frame == null) {
            // no frame option found
            m_frame = "none";
        } else if (m_frame.equals("random")) {
            // random frame
            final int i = (int)(Math.random() * Frame.values().length);
            m_frame = Frame.values()[i].getName();
        }

        // set the rotation
        final String rotation = m_configuration.get(Option.ROTATION.getName());
        if (rotation == null) {
            // no rotation option found
            m_rotation = 0;
        } else if (rotation.startsWith("random(")) {
            // random rotation ie. random(-5,5)
            final String[] range = CmsStringUtil.splitAsArray(rotation.substring(
                "random(".length(),
                rotation.length() - 1), ",");
            final int from = Integer.parseInt(range[0]);
            final int to = Integer.parseInt(range[1]);
            m_rotation = from + (int)(Math.random() * (to - from));
        } else {
            // fixed rotation
            try {
                m_rotation = Integer.parseInt(rotation);
            } catch (final Exception e) {
                m_rotation = 0;
            }
        }

        // set the thumbnail image
        m_thumbnail = m_resource;
        final String thumbnailUri = getThumbnailInfo(cms, thumbnailInfo, XmlNode.THUMBNAILURI.getName());
        if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(thumbnailUri)) {
            // additional thumbnail given
            m_thumbnail = cms.readResource(thumbnailUri);
        }
        m_thumbnailPath = cms.getSitePath(m_thumbnail);

        // set the thumbnail scaler
        m_scaler = new CmsImageScaler(cms, getThumbnail());
        // these are still the original dimensions since we have not override the scaler's width nor height
        final int oh = m_scaler.getHeight();
        final int ow = m_scaler.getWidth();
        m_oriWidth = ow;
        m_oriHeight = oh;
        // this are the thumbnail dimensions
        final int tw = getWidth();
        final int th = getHeight();

        float zoom = 1;
        boolean explicitCrop = false;
        final String crop = m_configuration.get(Option.CROP.getName());
        if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(crop) && !crop.equalsIgnoreCase("AUTO")) {
            // try to read the cropping info
            final Map<String, String> cropOpts = CmsStringUtil.splitAsMap(crop.toUpperCase(), ",", "=");
            try {
                m_cropLeft = Integer.parseInt(cropOpts.get(CropOption.X.name()));
                m_cropTop = Integer.parseInt(cropOpts.get(CropOption.Y.name()));
                m_cropWidth = Integer.parseInt(cropOpts.get(CropOption.W.name()));
                m_cropHeight = Integer.parseInt(cropOpts.get(CropOption.H.name()));
                explicitCrop = true;
            } catch (final Throwable t) {
                // most likely cropping is set to auto
                CmsMediaAlbumThumbnail.LOG.debug(t.getLocalizedMessage(), t);
            }
        }
        if (explicitCrop && (m_cropWidth > 0) && (m_cropHeight > 0)) {
            // handle explicit cropping
            final int cw = getCropWidth();
            final int ch = getCropHeight();

            final float zw = tw / (float)cw;
            final float zh = th / (float)ch;
            if (!floatEquals(zw, zh, 0.01f)) { // careful, these are floats!
                // TODO: we need to correct the cropping to use the right aspect ratio
            }
            // set the values
            m_cropWidth = cw;
            m_cropHeight = ch;
            zoom = zw;
        } else {
            // try to crop the biggest center part with the right aspect ratio
            // compare horizontal and vertical sizes
            final float zh = th / (float)oh;
            final float zw = tw / (float)ow;
            // select the best match
            zoom = Math.max(zh, zw);
            // compute the cropped zone
            m_cropWidth = (int)(tw / zoom);
            m_cropHeight = (int)(th / zoom);
            m_cropLeft = (ow - m_cropWidth) / 2;
            m_cropTop = (oh - m_cropHeight) / 2;
        }

        setZoom(zoom);

        m_scaler.setCropArea(getCropLeft(), getCropTop(), getCropWidth(), getCropHeight());
        m_scaler.setWidth(getWidth());
        m_scaler.setHeight(getHeight());
        m_scaler.setColor(getBackground());
        m_scaler.setQuality(getQuality());
        m_scaler.setRenderMode(getRenderMode());
        if (CmsStringUtil.isNotEmptyOrWhitespaceOnly(getFilter())) {
            m_scaler.setFilters(getFilter());
        }

        m_resourcePath = cms.getSitePath(resource);
        m_downScaleParam = ((album != null) && album.isDownscaleRequired(resource))
        ? album.getMaxSizeImageScaler().toRequestParam()
        : "";
        m_thumbParam = m_scaler.toRequestParam();
    }

    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(final Object obj) {

        if (!(obj instanceof CmsMediaAlbumThumbnail)) {
            return false;
        }
        final CmsMediaAlbumThumbnail that = (CmsMediaAlbumThumbnail)obj;
        if (!getScaler().toString().equals(that.getScaler().toString())) {
            return false;
        }
        if (!getShowTitle().equals(that.getShowTitle())) {
            return false;
        }
        if (!getTitle().equals(that.getTitle())) {
            return false;
        }
        return true;
    }

    /**
     * Returns the color.<p>
     *
     * @return the color
     */
    public String getBackground() {

        return m_configuration.get(Option.BACKGROUND.getName());
    }

    /**
     * Returns the configuration string.<p>
     * 
     * @return the configuration string
     */
    public String getConfiguration() {

        return CmsStringUtil.mapAsString(m_configuration, "|", ":");
    }

    /**
     * Returns the cropHeight.<p>
     *
     * @return the cropHeight
     */
    public int getCropHeight() {

        return m_cropHeight;
    }

    /**
     * Returns the cropLeft.<p>
     *
     * @return the cropLeft
     */
    public int getCropLeft() {

        return m_cropLeft;
    }

    /**
     * Returns the crop options.<p>
     * 
     * @return the crop options
     */
    public String getCropOptions() {

        return m_configuration.get(Option.CROP);
    }

    /**
     * Returns the cropTop.<p>
     *
     * @return the cropTop
     */
    public int getCropTop() {

        return m_cropTop;
    }

    /**
     * Returns the cropWidth.<p>
     *
     * @return the cropWidth
     */
    public int getCropWidth() {

        return m_cropWidth;
    }

    /**
     * Returns the downScaleParam.<p>
     *
     * @return the downScaleParam
     */
    public String getDownScaleParam() {

        return m_downScaleParam;
    }

    /**
     * Returns the filter.<p>
     *
     * @return the filter
     */
    public String getFilter() {

        return m_configuration.get(Option.FILTER.getName());
    }

    /**
     * Returns the frame.<p>
     *
     * @return the frame
     */
    public String getFrame() {

        return m_frame;
    }

    /**
     * Returns the height.<p>
     *
     * @return the height
     */
    public int getHeight() {

        return Integer.parseInt(m_configuration.get(Option.HEIGHT.getName()));
    }

    /**
     * Returns the image.<p>
     *
     * @return the image
     */
    public CmsResource getImage() {

        return m_resource;
    }

    /**
     * Returns the imagePath.<p>
     *
     * @return the imagePath
     */
    public String getImagePath() {

        return m_resourcePath;
    }

    /**
     * Returns the oriHeight.<p>
     *
     * @return the oriHeight
     */
    public int getOriHeight() {

        return m_oriHeight;
    }

    /**
     * Returns the oriWidth.<p>
     *
     * @return the oriWidth
     */
    public int getOriWidth() {

        return m_oriWidth;
    }

    /**
     * Returns the quality.<p>
     *
     * @return the quality
     */
    public int getQuality() {

        return Integer.parseInt(m_configuration.get(Option.QUALITY.getName()));
    }

    /**
     * Returns the renderMode.<p>
     *
     * @return the renderMode
     */
    public int getRenderMode() {

        return Integer.parseInt(m_configuration.get(Option.RENDERMODE.getName()));
    }

    /**
     * Returns the rotation.<p>
     *
     * @return the rotation
     */
    public int getRotation() {

        return m_rotation;
    }

    /**
     * Returns the image scaler.<p>
     *
     * @return the image scaler
     */
    public CmsImageScaler getScaler() {

        return m_scaler;
    }

    /**
     * Returns the showTitle.<p>
     *
     * @return the showTitle
     */
    public String getShowTitle() {

        return m_configuration.get(Option.TITLE.getName());
    }

    /**
     * Returns the needed info for initializing the JS image tool.<p>
     * 
     * @return the needed info for initializing the JS image tool
     * 
     * @throws JSONException if something goes wrong
     */
    public JSONObject getThumbInfo() throws JSONException {

        final JSONObject info = new JSONObject();
        info.put("left", getCropLeft());
        info.put("top", getCropTop());
        info.put("zoom", getZoom());
        return info;
    }

    /**
     * Returns the thumbnail resource.<p>
     * 
     * @return the thumbnail resource
     */
    public CmsResource getThumbnail() {

        return m_thumbnail;
    }

    /**
     * Returns the thumbnailPath.<p>
     *
     * @return the thumbnailPath
     */
    public String getThumbnailPath() {

        return m_thumbnailPath;
    }

    /**
     * Returns the thumbParam.<p>
     *
     * @return the thumbParam
     */
    public String getThumbParam() {

        return m_thumbParam;
    }

    /**
     * Returns the title.<p>
     *
     * @return the title
     */
    public String getTitle() {

        return m_title;
    }

    /**
     * Returns the width.<p>
     *
     * @return the width
     */
    public int getWidth() {

        return Integer.parseInt(m_configuration.get(Option.WIDTH.getName()));
    }

    /**
     * Returns the zoom level.<p>
     *
     * @return the zoom level
     */
    public float getZoom() {

        return m_zoom;
    }

    /**
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {

        return (getScaler() + getShowTitle() + getTitle()).hashCode();
    }

    /**
     * Sets a new size for this thumbnail.<p>
     * 
     * @param width the width in pixels
     * @param height the height in pixels
     */
    public void setSize(final int width, final int height) {

        m_configuration.put(Option.WIDTH.getName(), "" + width);
        m_configuration.put(Option.HEIGHT.getName(), "" + height);
        m_scaler.setWidth(getWidth());
        m_scaler.setHeight(getHeight());
        m_thumbParam = m_scaler.toRequestParam();
    }

    /**
     * Sets the thumbnail position.<p>
     * 
     * @param left the left position
     * @param top the top position
     * @param zoom the zoom level
     */
    public void setThumbPosition(final int left, final int top, final float zoom) {

        final int tw = getWidth();
        final int th = getHeight();
        final int ow = getOriWidth();
        final int oh = getOriHeight();
        float z = zoom;
        int cw = (int)(tw / z);
        int ch = (int)(th / z);
        while ((cw + left > ow) || (ch + top > oh)) {
            if (cw + left > ow) {
                cw = ow - left;
                z = tw / cw;
                ch = (int)(th / z);
            }
            if (ch + top > oh) {
                ch = oh - top;
                z = th / ch;
                cw = (int)(tw * z);
            }
        }
        // set the values
        m_scaler.setCropArea(left, top, cw, ch);
        setZoom(z);
        m_thumbParam = m_scaler.toRequestParam();

        // Set the configuration
        final Map<String, String> cropOptions = new HashMap<String, String>();
        cropOptions.put(CropOption.X.name(), "" + left);
        cropOptions.put(CropOption.Y.name(), "" + top);
        cropOptions.put(CropOption.W.name(), "" + cw);
        cropOptions.put(CropOption.H.name(), "" + ch);
        m_configuration.put(Option.CROP.getName(), CmsStringUtil.mapAsString(cropOptions, ",", "=").toLowerCase());

        // Set the computed values
        m_cropLeft = left;
        m_cropTop = top;
        m_cropWidth = cw;
        m_cropHeight = ch;
    }

    /**
     * Sets the title.<p>
     *
     * @param title the title to set
     */
    public void setTitle(final String title) {

        m_title = title;
    }

    /**
     * Tests if the given floats are equals, with respect to the given threshold.<p>
     * 
     * @param f1 first float to compare
     * @param f2 second float to compare
     * @param threshold the threshold
     * 
     * @return <code>true</code> if they are equal
     */
    protected boolean floatEquals(final float f1, final float f2, final float threshold) {

        return Math.abs(f1 - f2) < threshold;
    }

    /**
     * Returns the thumbnail information from the XML content value.<p>
     * 
     * @param cms the current cms context
     * @param thumbnailInfo the XML contene value to get the information from
     * @param value the value to retrieve
     * 
     * @return the requested string value
     */
    protected String getThumbnailInfo(final CmsObject cms, final I_CmsXmlContentValue thumbnailInfo, final String value) {

        if (thumbnailInfo == null) {
            return null;
        }
        try {
            return thumbnailInfo.getDocument().getStringValue(
                cms,
                CmsXmlUtils.concatXpath(thumbnailInfo.getPath(), value),
                cms.getRequestContext().getLocale());
        } catch (final Throwable t) {
            CmsMediaAlbumThumbnail.LOG.debug(t.getLocalizedMessage(), t);
        }
        return null;
    }

    /**
     * Sets the zoom with 2 decimal positions.
     * 
     * @param zoom the new zoom level to set
     */
    protected void setZoom(final float zoom) {

        m_zoom = ((int)(zoom * 100)) / 100f;
    }
}
