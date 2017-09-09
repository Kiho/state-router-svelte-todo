import Component from './tasks.html'
import NoTaskSelected from './no-task-selected.html'
import { allWithAsync } from '../../../router/async';

const model = require('../../../../modules/model.js')

const UUID_V4_REGEX = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'

export default function(stateRouter: IStateRouter) {
	stateRouter.addState({
		name: 'app.topics.tasks',
		route: '/:topicId(' + UUID_V4_REGEX + ')', 
		template: {
			component: Component,
			options: {
				methods: {
					setTaskDone: function(index, done) {
						const topicId = this.get('topicId')
						const tasks = this.get('tasks').slice()
						tasks[index].done = done

						this.set({ tasks })

						model.saveTasks(topicId, tasks)
					}
				}
			}
		},
		resolve: async function(data, parameters) {
			const topicId = parameters.topicId;
			const topic = model.getTopicAsync.bind(null, topicId);
			const tasks = model.getTasksAsync.bind(null, topicId);
			return allWithAsync(topic(), tasks(), topicId)
				.then(data => ({ topic: data[0], tasks: data[1], topicId: data[2] }));
		},
		activate: function(context) {
			const svelte = context.domApi
			const topicId = context.parameters.topicId
			console.log('activate - topicId', topicId)
			svelte.on('newTaskKeyup', function(e) {
				const newTaskName = svelte.get('newTaskName')
				if (e.keyCode === 13 && newTaskName) {
					createNewTask(newTaskName)
					svelte.set({
						newTaskName: ''
					})
				}
			})

			svelte.on('remove', function(taskIndex) {
				const topicId = svelte.get('topicId')
				let tasksWithIndexElementRemoved = svelte.get('tasks').slice()

				tasksWithIndexElementRemoved.splice(taskIndex, 1)
				console.log('tasksWithIndexElementRemoved', topicId, tasksWithIndexElementRemoved)

				svelte.set({
					tasks: tasksWithIndexElementRemoved
				})

				model.saveTasks(topicId, tasksWithIndexElementRemoved)
			})

			function createNewTask(taskName) {
				const task = model.saveTask(topicId, taskName)
				const newTasks = svelte.get('tasks').concat(task)
				svelte.set({
					tasks: newTasks
				})
			}

			svelte.findElement('.add-new-task').focus()
		}
	})

	stateRouter.addState({
		name: 'app.topics.no-task',
		route: '',
		template: NoTaskSelected
	})
}
