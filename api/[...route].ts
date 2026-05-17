import { app } from '../server/index'

export default {
  fetch(request: Request) {
    return app.fetch(request)
  },
}
