<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p v-for="(item, index) in data" :key="index">{{ item.name }}</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      data: []
    }
  },
  mounted () {
    this.getUserInfo(1)

    this.errorRequestDemo()

    this.requestPathDemo()
  },
  methods: {
    getUserInfo (_id) {
      this.axios({
        url: '/api/users.json',
        method: 'get',
        params: { 'id': _id }
      }).then(response => {
        console.log('users', response)
      })
    },
    errorRequestDemo () {
      this.axios({
        url: '/getUsersInfo.json',
        method: 'get',
        params: {}
      }).then(response => {
        console.log('getUsersInfo', response)
      })
    },
    requestPathDemo () {
      this.axios({
        url: '/api/',
        method: 'get',
        params: {}
      }).then(response => {
        console.log('requestPathDemo', response)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
