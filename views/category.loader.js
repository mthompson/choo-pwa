const https = require('https')
const fetch = require('node-fetch')
const splitRequire = require('split-require')

const { onChangeWith } = require('../plugins/choo-data/utils')

const agent = new https.Agent({
  rejectUnauthorized: false
})

const getCategoryData = async ([ params, page ], oldData) => {
  const response = await fetch(`https://localhost:3000/api/articles/${params.category}?page=${page}`, { agent })
  const data = await response.json()
  if (!oldData || oldData.category !== params.category) {
    return data
  } else {
    return {
      ...data,
      data: [...oldData.data, ...data.data]
    }
  }
}

const importCategory = () => new Promise((resolve, reject) => splitRequire('./category', (err, bundle) => err ? reject(err) : resolve(bundle)))

function category (app) {
  return async (state, emit) => {
    const [ bundle, data ] = await Promise.all([
      app.bundles.load('./category', importCategory),
      app.data.load('category', getCategoryData, onChangeWith(state.params, page => page || 0))
    ])

    const loadMore = () => app.data.load('category', getCategoryData, onChangeWith(state.params, page => page + 1))

    return bundle(data, loadMore)
  }
}

module.exports = category
