/** Matches `/uploads/{section}/{file}` and `/uploads/{section}/{subfolder}/{file}`. */
export const LOCAL_UPLOAD_PATH_REGEX = /^\/uploads\/[^/]+(?:\/[^/]+)+$/;
