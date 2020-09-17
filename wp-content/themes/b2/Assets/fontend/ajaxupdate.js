var ajaxupdate = new Vue({
    el:'.update-box',
    data:{
        type:'',
        commentVote:{
            pages:0,
            paged:1,
            status:'ready'
        },
        postVote:{
            pages:0,
            paged:1,
            status:'ready'
        },
        buy:{
            pages:0,
            paged:1
        },
        ds:{
            pages:0,
            paged:1
        },
        follow:{
            pages:0,
            paged:1
        },
        sc:{
            pages:0,
            paged:1
        },
    },
    methods:{
        update(type){
            if(this.type){
                if(this[this.type].status === 'success') return
                this[this.type].status = 'go'    
            }
            
            this.type = type
            
            this.$http.post(b2_rest_url+'ajaxupdate','type='+type+'&paged='+this[this.type].paged).then(res=>{

                if(res.data !=='success'){
                    this.$set(this[this.type],'paged',this[this.type].paged+1)
                    this.update(this.type)
                }else{
                    this[this.type].status = 'success'
                }
                
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this[this.type].status = 'ready'
            })
        }
    }
})