import { http, HttpResponse } from 'msw';
import { coffees } from '../catalog/test-data';

export const handlers = [http.get('/api/coffees', () => HttpResponse.json({ data: coffees }))];
