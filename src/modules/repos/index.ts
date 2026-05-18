import { OpenAPIHono } from '@hono/zod-openapi';
import releasesRoute from './releases/releases.router';
import searchRoute from './search/search.route';

const reposRouter = new OpenAPIHono();

reposRouter.route('/search', searchRoute);
reposRouter.route('/releases', releasesRoute);

export default reposRouter;
