/*
 * File   : $Source: /usr/local/cvs/opencms/src/org/opencms/workplace/editors/ade/Attic/Messages.java,v $
 * Date   : $Date: 2009-10-13 11:59:43 $
 * Version: $Revision: 1.1.2.8 $
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

import org.opencms.i18n.A_CmsMessageBundle;
import org.opencms.i18n.I_CmsMessageBundle;

/**
 * Convenience class to access the localized messages of this OpenCms package.<p> 
 * 
 * @author Michael Moossen 
 * 
 * @version $Revision: 1.1.2.8 $ 
 * 
 * @since 6.0.0 
 */
public final class Messages extends A_CmsMessageBundle {

    /** Message constant for key in the resource bundle. */
    public static final String ERR_GENERATE_FORMATTED_ELEMENT_3 = "ERR_GENERATE_FORMATTED_ELEMENT_3";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_INVALID_ID_1 = "ERR_INVALID_ID_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_JSON_INVALID_ACTION_URL_1 = "ERR_JSON_INVALID_ACTION_URL_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_JSON_MISSING_PARAMETER_1 = "ERR_JSON_MISSING_PARAMETER_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_JSON_WRONG_PARAMETER_VALUE_2 = "ERR_JSON_WRONG_PARAMETER_VALUE_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SERVER_EXCEPTION_1 = "ERR_SERVER_EXCEPTION_1";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_FILE_0 = "GUI_DEFAULT_FORMATTER_FILE_0";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_FILE_1 = "GUI_DEFAULT_FORMATTER_FILE_1";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_NEWNAME_0 = "GUI_DEFAULT_FORMATTER_NEWNAME_0";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_NEWNAME_1 = "GUI_DEFAULT_FORMATTER_NEWNAME_1";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_TEXT_0 = "GUI_DEFAULT_FORMATTER_TEXT_0";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_TYPE_0 = "GUI_DEFAULT_FORMATTER_TYPE_0";

    /** Message constant for key in the resource bundle. */
    public static final String GUI_DEFAULT_FORMATTER_TYPE_1 = "GUI_DEFAULT_FORMATTER_TYPE_1";

    /** Name of the used resource bundle. */
    private static final String BUNDLE_NAME = "com.alkacon.opencms.mediaalbum.messages";

    /** Static instance member. */
    private static final I_CmsMessageBundle INSTANCE = new Messages();

    /**
     * Returns an instance of this localized message accessor.<p>
     * 
     * @return an instance of this localized message accessor
     */
    public static I_CmsMessageBundle get() {

        return Messages.INSTANCE;
    }

    /**
     * Hides the public constructor for this utility class.<p>
     */
    private Messages() {

        // hide the constructor
    }

    /**
     * Returns the bundle name for this OpenCms package.<p>
     * 
     * @return the bundle name for this OpenCms package
     */
    public String getBundleName() {

        return Messages.BUNDLE_NAME;
    }
}