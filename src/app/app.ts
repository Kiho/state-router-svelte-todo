import Component from './app.html'
import About from './about/about'
import Topics from './topics/topics'

const model = require('../../modules/model.js')

export default function(stateRouter: IStateRouter) {
	stateRouter.addState({
		name: 'app',
		route: '/app',
		defaultChild: 'topics',
		template: Component,
		resolve: async function resolve(data, parameters, cb) {
			const currentUser = model.getCurrentUser()

			if (currentUser.name) {
				return { currentUser };
			} else {
				cb.redirect('login')
			}
		},
		activate: function({ domApi: svelte }) {
			svelte.on('logout', function() {
				model.saveCurrentUser(null)
				stateRouter.go('login')
			})
		}
	})

	About(stateRouter)
	Topics(stateRouter)
}
