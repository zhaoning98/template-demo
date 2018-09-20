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
    this.getUserInfo(1)
    this.getUserInfo(2)

    setTimeout(() => {
      this.getUserInfo(3)

      this.getUserInfo(1)
    }, 4000)

    this.errorRequestDemo()
  },
  methods: {
    getUserInfo (_id) {
      this.axios({
        url: '/users',
        method: 'get',
        params: { 'id': _id }
      }).then(response => {
        console.log(response)
      })
    },
    errorRequestDemo () {
      this.axios({
        url: '/users123',
        method: 'get',
        params: {}
      }).then(response => {
        this.data.push(response.data[0])
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
