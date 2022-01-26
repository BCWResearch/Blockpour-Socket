
 const redis = require('redis');
  const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
  /**
   * This class will hold all the redis related helper methods to interact with the redis client
   * It will act as a bridge between the node services and redis client.
   */
 
  class RedisUtilClass{
      client = null;
      connected = false;
 
      /**
      * Single object pattern to create the redis connection
      */
      static async createConnection(){
         if(!this.connected){
             this.client = redis.createClient({
                 url
             });
             await this.client.connect();
             this.client.on('connect', function() {
                 console.log('Connected!');
                 this.connected = true
             });
             this.client.on('error', function(error) {
               console.log('Error occured! ', error);
               this.connected = false
             })
         }
      }
 
     static async getValue(key){
         try{
             await this.createConnection()
             const data = await this.client.get(key);
             return {
                 status: true,
                 data
             }
         }catch(error){
             return {
                 status: false,
                 error
             }
         }
     }

     static async getKeys(key){
        try{
            await this.createConnection()
            const data = await this.client.keys(key);
            return {
                status: true,
                data
            }
        }catch(error){
            return {
                status: false,
                error
            }
        }
     }
  }
 
  module.exports = RedisUtilClass
 