import { OpenAPIHono } from '@hono/zod-openapi';
import searchRoute from './search/search.route';

const reposRouter = new OpenAPIHono();

reposRouter.route('/search', searchRoute);

export default reposRouter;
