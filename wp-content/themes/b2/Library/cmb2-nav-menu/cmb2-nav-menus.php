<?php defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

if (! class_exists('CMB2_NavMenus')) {
    class CMB2_NavMenus
    {
        static function init()
        {
            // if (! class_exists('CMB2')) {
            //     return;
            // }
            require_once( ABSPATH . 'wp-admin/includes/nav-menu.php' );
            // Include files
            require_once B2_THEME_DIR.'/Library/cmb2-nav-menu/src/Integration.php';
            require_once B2_THEME_DIR.'/Library/cmb2-nav-menu/src/WalkerNavMenuEdit.php';
            require_once B2_THEME_DIR.'/Library/cmb2-nav-menu/src/helpers.php';

            // Initialize plugin
            \NSRosenqvist\CMB2\NavMenus\Integration::init();
        }
    }
}
add_action('init', [CMB2_NavMenus::class, 'init']);
