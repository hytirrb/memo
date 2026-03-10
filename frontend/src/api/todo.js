import axios from 'axios'

const BASE = '/todos'

export const getTodos = () => axios.get(BASE)

export const createTodo = (data) => axios.post(BASE, data)

export const updateTodo = (id, data) => axios.put(`${BASE}/${id}`, data)

export const deleteTodo = (id) => axios.delete(`${BASE}/${id}`)

export const toggleTodo = (id) => axios.patch(`${BASE}/${id}/toggle`)
