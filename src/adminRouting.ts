export const ADMIN_HOST = 'admin.queerclubdirectory.org';
export const isAdminHost = (hostname: string) => hostname === ADMIN_HOST || hostname === 'admin.localhost';
export const adminPath = (page: string) => `${isAdminHost(window.location.hostname) ? '' : '/admin'}/${page}`;
