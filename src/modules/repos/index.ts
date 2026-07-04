import type { AppEnv } from '@/types/AppEnv';
import { OpenAPIHono } from '@hono/zod-openapi';
import changelogRoute from './changelog/changelog.route';
import releasesRoute from './releases/releases.route';
import searchRoute from './search/search.route';

const reposRouter = new OpenAPIHono<AppEnv>();

reposRouter.route('/search', searchRoute);
reposRouter.route('/releases', releasesRoute);
reposRouter.route('/changelog', changelogRoute);

export default reposRouter;
