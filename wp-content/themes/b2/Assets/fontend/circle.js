var b2CirclePostBox = new Vue({
    el:'#po-topic-box',
    data:{
        single:{
            is:false,
            id:0
        },
        admin:{
            is:false
        },
        character:{
            length:0,
            min:0,
            max:10,
            over:false
        },
        showPoBox:true,
        disabled:false,
        locked:false,
        userData:{
            avatar:'',
        },
        allowSubmit:'less',
        topicType:'say',
        topicTypeBox:false,
        joinLocked:false,
        circle:{
            show:false,
            list:'',
            picked:0,
            gc:0
        },
        currentUser:{
            currentCircleRole:{
                type:'free',
                data:[]
            },
            inCircle:false,
            allowCreateTopic:false,
            isAdmin:false,
            isCircleAdmin:false,
            mediaRole:{
                card: '',
                file: '',
                image: '',
                video: ''
            },
            topicTypeRole:{
                ask: '',
                guess: '',
                vote: ''
            },
            readRole:{
                public:true,
                logon:false,
                comment:false,
                credit:false,
                money:false,
                lv:false
            },
            credit:0,
            money:0,
            darkRoom:false,
        },
        join:{
            why:'',
            picked:''
        },
        login:true,
        timeout:false,
        ask:{
            userInput:'',
            locked:false,
            userList:[],
            focus:false,
            pickedList:[],
            picked:false,
            type:'someone',
            reward:'credit',
            time:'',
            pay:'',
            userCount:4,
            hiddenInput:false,
        },
        vote:{
            type:'radio',
            list:['']
        },
        guess:{
            list:[''],
            right:0
        },
        image:{
            allow:true,
            list:[],
            count:5,
            oldNum: 0,
            newNum: 0,
            indexMark:0
        },
        video:{
            allow:true,
            list:[],
            count:5,
            oldNum: 0,
            newNum: 0,
            indexMark:0
        },
        file:{
            allow:true,
            list:[],
            count:5,
            oldNum: 0,
            newNum: 0,
            indexMark:0
        },
        card:{
            show:false,
            allow:true,
            list:[],
            count:5,
            oldNum: 0,
            newNum: 0,
            indexMark:0,
            input:'',
            locked:false
        },
        role:{
            show:false,
            list:'',
            see:'public',
            money:'',
            credit:'',
            lv:[],
            lvPicked:[],
            currentCircle:0
        },
        smileShow:false,
        uploadType:'',
        errorFile:false
    },
    mounted(){
        this.single.is = this.$refs.circleSingle
        this.admin.is = this.$refs.circleAdmin
        if(this.single.is){
            this.circle.picked = this.$refs.circleSingle.getAttribute('data-circleId')
        }else if(this.admin.is){
            this.circle.picked = this.$refs.circleAdmin.getAttribute('data-circleId')
        }else{
            if(!this.$refs.textareaTopic) return
            if(B2ClientWidth >= 768){
                this.showPoBox = true
            }else{
                this.showPoBox = false
            }

            autosize(this.$refs.textarea_title)
            autosize(this.$refs.textarea_box)
            let userData = userTools.userData
            if(userData.user_link){
                this.userData = userData
                this.login = true
            }else{
                this.login = false
            }
            this.character.min = this.$refs.textareaTopic.getAttribute('data-min')
            this.character.max = this.$refs.textareaTopic.getAttribute('data-max')
            this.image.count = this.$refs.imgbutton.getAttribute('data-imgcount')
            this.video.count = this.$refs.videobutton.getAttribute('data-videocount')
            this.file.count = this.$refs.filebutton.getAttribute('data-filecount')
            this.card.count = this.$refs.cardbutton.getAttribute('data-cardcount')
            // this.$set(this.card,'list',JSON.parse(localStorage.getItem('card_test')))
            this.role.list = JSON.parse(this.$refs.role.getAttribute('data-roledata'))
            this.role.lv = JSON.parse(this.$refs.role.getAttribute('data-lvs'))
            this.circle.picked = this.$refs.textareaTopic.getAttribute('data-circle')
            this.circle.gc = parseInt(this.$refs.textareaTopic.getAttribute('data-gc'))
        }

        this.getCurrentUserCircleData()
    },
    methods:{
        getCurrentUserCircleData(){
            this.$http.post(b2_rest_url+'getCurrentUserCircleData','circle_id='+this.circle.picked).then(res=>{
                this.defaultCircle(res.data.circles)
                this.currentUser.allowCreateTopic = res.data.allow_create_topic
                this.currentUser.currentCircleRole = res.data.current_circle_role
                if(this.currentUser.currentCircleRole.type === 'money'){
                    this.join.picked = this.currentUser.currentCircleRole.data[0].type
                }
                this.currentUser.isAdmin = res.data.is_admin
                this.currentUser.isCircleAdmin = res.data.is_circle_admin
                this.currentUser.inCircle = res.data.in_circle
                this.currentUser.darkRoom = res.data.dark_room
                this.circle.list = res.data.circles
                this.currentUser.money = res.data.money
                this.currentUser.credit = res.data.credit
                Object.keys(res.data.circles).forEach(key => {
                    if(res.data.circles[key].is_circle_admin){
                        b2CircleList.circle.created[key] = res.data.circles[key]
                    }else if(key != b2CircleList.circle.picked){
                        b2CircleList.circle.join[key] = res.data.circles[key]
                    }
                });

                this.currentUser.mediaRole = res.data.media_role
                this.currentUser.topicTypeRole = res.data.topic_type_role
                this.currentUser.readRole = res.data.read_role
                this.$refs.poFormBox.style.opacity = 1
            })
        },
        defaultCircle(data){
            for (var a in data) {
                if (data[a].default === true) {
                    this.$set(this.circle,'picked',data[a].id)
                } 
            }
        },
        loginAc(type){
            login.show = true
            login.loginType = type
        },
        searchUser(){
            if(this.ask.userInput === '') return
            if(this.ask.locked == true) return
            this.ask.locked = true
            this.$http.post(b2_rest_url+'searchUsers','nickname='+this.ask.userInput).then(res=>{
                if(res.data.length > 0){
                    this.ask.userList = res.data
                }else{
                    this.ask.userList = []
                }
                this.ask.locked = false
            }).catch(err=>{
                this.ask.locked = false
                this.ask.userList = []
            })
        },
        placeholder(){
            return b2_global.js_text.circle[this.topicType]
        },
        addVoteList(){
            if(this.vote.type === 'pk' && this.vote.list.length >= 2) return
            this.vote.list.push('')
        },
        subVoteList(index){
            this.$delete(this.vote.list,index)
        },
        addGuessList(){
            this.guess.list.push('')
        },
        subGuessList(index){
            this.$delete(this.guess.list,index)
        },
        pickedUser(id,name,avatar){

            //检查是否添加过
            for (let i = 0; i < this.ask.pickedList.length; i++) {
                if(this.ask.pickedList[i].id === id){
                    this.$toasted.show(b2_global.js_text.circle.repeat_id, { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 3000,
                        className:'modal-toast',
                        type:'error'
                    });
                    return
                }
            }
            this.ask.pickedList.push({'id':id,'name':name,'avatar':avatar})
            this.ask.focus = false
            this.ask.picked = true
            this.ask.userInput = ''
            this.ask.userList = []

            if(this.ask.pickedList.length >= this.ask.userCount){
                this.ask.hiddenInput = true
                return
            }else{
                this.ask.hiddenInput = false
            }
        },
        removePickedUser(index){
            this.$delete(this.ask.pickedList,index)
            if(this.ask.pickedList.length >= this.ask.userCount){
                this.ask.hiddenInput = true
                return
            }else{
                this.ask.hiddenInput = false
            }
        },
        percentage(character){
            if(this.character.min > character){
                return Calc.Mul(Calc.Div(character,this.character.min),100);
            }

            if(this.character.max >= character && this.character.min < character){
                return Calc.Mul(Calc.Div(character,this.character.max),100);
            }

            return 100;
        },
        nFormatter(num) {
            isNegative = false
            if (num < 0) {
                isNegative = true
            }
            num = Math.abs(num)
            if (num >= 1000000000) {
                formattedNumber = (num/1000000000).toFixed(1).replace(/.0$/, '') + 'G';
            }else if (num >= 1000000) {
                formattedNumber = (num/1000000).toFixed(1).replace(/.0$/, '') + 'M';
            }else if (num >= 1000) {
                formattedNumber = (num/1000).toFixed(1).replace(/.0$/, '') + 'K';
            }else {
                formattedNumber = num;
            } 
            if(isNegative) { formattedNumber = '-' + formattedNumber }
            return formattedNumber;
        },
        makesvg(percentage, inner_text='',character = 0){

            let abs_percentage = Math.abs(percentage).toString(),classes = '';
            
            if(this.character.min == 0 && character == 0){
                classes = '';
            }else if(this.character.max >= character && this.character.min <= character){
                classes = "success-stroke";
            } else if(character != 0){
                classes = "warning-stroke";
            }
          
           let svg = `<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">
                    <circle class="circle-chart__background" cx="16.9" cy="16.9" r="15.9" />
                    <circle class="circle-chart__circle ${classes}"
                    stroke-dasharray="${abs_percentage},100"    cx="16.9" cy="16.9" r="15.9" />
                    <g class="circle-chart__info">
                    <text class="circle-chart__subline ${classes}" x="16.91549431" y="22">${inner_text}</text>
                    </g></svg>`;

            return svg
        },
        changeText(){
            this.character.length = this.$refs.textarea_box.value.length;

            if(this.character.length < this.character.min){
                this.allowSubmit = 'less'
            }else if(this.character.length > this.character.max){
                this.allowSubmit = 'more'
            }else{
                this.allowSubmit = 'allow'
            }
        },
        addSmile(val){
            grin(val,this.$refs.textarea_box)
        },
        fileExists(mime){
            let index= mime.lastIndexOf('.');
            let ext = mime.substr(index+1);
            return ext;
        },
        readablizeBytes(bytes) {
            let s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
            let e = Math.floor(Math.log(bytes)/Math.log(1024));
            return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+' '+s[e];
        },
        getFile(event,type){
            if(this.uploadType != ''){
                this.$toasted.show(b2_global.js_text.circle['img_locked'], { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 3000,
                    className:'modal-toast',
                    type:'error'
                });
                return false;
            } 
            this.uploadType = type
            let files = event.target.files
            if(!files) return;

            let index = this[type].indexMark
            for (let i = index; i < (files.length + index); i++) {
                if(this[type].list.length < this[type].count){
                    if(type === 'image' || type === 'video'){
                        this.$set(this[type].list,i,{'id':0,'url':window.URL.createObjectURL(files[i - index]),'progress':0,'success':false,})
                    }else{
                        this.$set(this[type].list,i,{'id':0,'url':'','progress':0,'success':false,'ext':this.fileExists(files[i - index].name),'size':this.readablizeBytes(files[i - index].size),'name':files[i - index].name})
                    }
                    this.uploadFile(files[i - index],i,type)
                    this[type].indexMark++
                }else{
                    this.$toasted.show(b2_global.js_text.circle[type+'_count'], { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 3000,
                        className:'modal-toast',
                        type:'error'
                    });
                    break;
                }
            }
        },
        subLocked(){
            if(this.locked) return true
            if(this.allowSubmit != 'allow') return true
            if(this.uploadType != '') return true
            if(this.errorFile == true) return true
        },
        subText(){
            if(this.locked) return b2_global.js_text.circle.subing
            if(this.allowSubmit == 'less') return b2_global.js_text.circle.text_less
            if(this.allowSubmit == 'more') return b2_global.js_text.circle.text_more
            if(this.uploadType != '') return b2_global.js_text.circle.waiting_uploads
            if(this.errorFile == true) return b2_global.js_text.circle.file_error

            return b2_global.js_text.circle.submit
        },
        uploadLocked(type){

            if(!type){
                type = this.uploadType
            }

            let allow = false
            this.errorFile = false

            for (let i = 0; i < this[type].list.length; i++) {
                if(!this[type].list[i].success){
                    allow = true
                }

                if(this[type].list[i].success == 'fail'){
                    this.errorFile = true
                }
            }

            if(!allow){
                this.uploadType = ''
            }

            return allow
        },
        uploadFile(file,i,type){
            let formData = new FormData()

            formData.append('file',file,file.name)
            formData.append("post_id", 1)
            formData.append("type", 'circle')

            let config = {
                onUploadProgress: progressEvent=>{
                    this.$set(this[type].list[i],'progress',progressEvent.loaded / progressEvent.total * 100 | 0)
                }
            }

            this.$http.post(b2_rest_url+'fileUpload',formData,config).then(res=>{

                this.$set(this[type].list[i],'progress',100)
                this.$set(this[type].list[i],'id',res.data.id)
                this.$set(this[type].list[i],'success',true)
                this.$set(this[type].list[i],'locked',false)
                
                this.$refs[type+'Input'].value = null
                this.uploadLocked()
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.$set(this[type].list[i],'success','fail')
                this.$refs[type+'Input'].value = null
                this.uploadLocked()
            })
        },
        removeFile(index,type){
            if(this.uploadType == type) return
            if(confirm(b2_global.js_text.circle['remove_'+type])){
                this.$delete(this[type].list,index)
                this[type].indexMark = this[type].list.length
                this.uploadLocked(type)
            }
        },
        dragstart(value,type) {
            if(this.uploadType !== '') return
            this[type].oldNum = value;
        },
        dragend(value,type) {
            if(this.uploadType !== '') return
            if (this[type].oldNum != this[type].newNum) {
                let oldIndex = this[type].list.indexOf(this[type].oldNum);
                let newIndex = this[type].list.indexOf(this[type].newNum);
                let newItems = [...this[type].list];
                newItems.splice(oldIndex, 1); 
                newItems.splice(newIndex, 0, this[type].oldNum);
                this[type].list = [...newItems];
            }
        },
        dragenter(value,type) {
            if(this.uploadType !== '') return
            this[type].newNum = value;
        },
        insertCard(){
            if(this.card.locked === true) return
            this.card.locked = true
            if(!this.card.input) return
            this.$http.post(b2_rest_url+'insertTopicCard','id='+this.card.input).then(res=>{
                this.card.list.push({'data':res.data,'progress':100,'id':res.data.id,'success':true})
                this.card.locked = false
                this.card.input = ''
                this.card.show = false
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.card.locked = false
            })
        },
        resetTopic(){
            this.$refs.textarea_title.value = ''
            this.$refs.textarea_box.value = ''
            this.topicType = 'say'
            this.ask = {
                userInput:'',
                locked:false,
                userList:[],
                focus:false,
                pickedList:[],
                picked:false,
                type:'someone',
                reward:'credit',
                time:'',
                pay:'',
                userCount:4,
                hiddenInput:false
            }
            this.vote = {
                type:'radio',
                list:['']
            }
            this.guess = {
                list:[''],
                right:0
            }
            this.image = {
                allow:true,
                list:[],
                count:5,
                oldNum: 0,
                newNum: 0,
                indexMark:0
            }
            this.video = {
                allow:true,
                list:[],
                count:5,
                oldNum: 0,
                newNum: 0,
                indexMark:0
            }
            this.file = {
                allow:true,
                list:[],
                count:5,
                oldNum: 0,
                newNum: 0,
                indexMark:0
            }
            this.card = {
                show:false,
                allow:true,
                list:[],
                count:5,
                oldNum: 0,
                newNum: 0,
                indexMark:0,
                input:'',
                locked:false
            }
            this.role = {
                show:false,
                list:'',
                see:'public',
                money:'',
                credit:'',
                lv:[],
                lvPicked:[],
                currentCircle:0
            }
        },
        submitTopic(){
            if(this.locked === true) return
            this.locked = true

            let data = {
                'type':this.topicType,
                'circle':this.circle.picked,
                'ask':this.ask,
                'vote':this.vote,
                'guess':this.guess,
                'title':this.$refs.textarea_title.value,
                'content':this.$refs.textarea_box.value,
                'image':this.image,
                'video':this.video,
                'file':this.file,
                'card':this.card,
                'role':this.role
            }

            this.$http.post(b2_rest_url+'insertCircleTopic',Qs.stringify(data)).then(res=>{
                b2CircleList.data.unshift(res.data)
                b2CircleList.$nextTick(()=>{
                    document.querySelector('.circle-topic-item-'+res.data.topic_id).classList += ' new-topic'
                    b2RestTimeAgo(document.querySelectorAll('.circle-topic-item-'+res.data.topic_id+' .b2timeago'))
                    imagesLoaded( document.querySelectorAll('.circle-topic-item'), function( instance ) {
                        b2SidebarSticky()
                    });
                    lazyLoadInstance.update()
                    this.resetTopic()

                })
                this.locked = false
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.locked = false
            })
        },
        getCircleData(id,type,child){
            if(this.circle.list[id]){
                if(child){
                    return this.circle.list[id][type][child]
                }
                return this.circle.list[id][type]
            }
            
            return ''
        },
        joinCircle(){
            if(this.joinLocked === true) return
            this.joinLocked = true
            this.$http.post(b2_rest_url+'joinCircle','circle_id='+this.circle.picked).then(res=>{
                if(res.data === 'success'){
                    this.$toasted.show(b2_global.js_text.circle.join_success, {
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 1000,
                        type:'success'
                    })
                    setTimeout(() => {
                        this.getCurrentUserCircleData()
                        this.joinLocked = false
                    }, 1000);
                }else{
                    this.getCurrentUserCircleData()
                    this.joinLocked = false
                }
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.joinLocked = false
            })
        },
        joinPay(){
            let money
            for (let i = 0; i < this.currentUser.currentCircleRole.data.length; i++) {
                if(this.currentUser.currentCircleRole.data[i].type === this.join.picked){
                    money = this.currentUser.currentCircleRole.data[i].money
                }
            }

            b2DsBox.data = {
                'title':b2_global.js_text.circle.join_title,
                'order_type':'circle_join',
                'order_price':money,
                'order_key':this.join.picked,
                'post_id':this.circle.picked
            }
            b2DsBox.show = true
            return
        }
    }
})

var b2CircleList = new Vue({
    el:'#circle-topic-list',
    data:{
        single:{
            is:false,
            id:0
        },
        admin:{
            is:false,
            type:'topic',
            userList:''
        },
        type:'all',
        circleData:'',
        circleId:0,
        paged:1,
        locked:false,
        reload:false,
        data:'',
        pages:1,
        circle:{
            picked:{
                type:'default',
                id:''
            },
            current:'default',
            showBox:'default',
            created:{},
            join:{}
        },
        topicFliter:{
            show:false,
            type:'all',
            orderBy:'date',
            role:'all',
            file:'all',
            best:0
        },
        video:{
            index:0,
            id:0,
            action:false
        },
        image:{
            showImageLightBox:false,
            index:0
        },
        commentBox:{
            index:'',
            childIndex:'',
            focus:false,
            img:'',
            imgId:0,
            showImgBox:'',
            locked:false,
            imageLocked:false,
            parent:0,
            progress:0
        },
        commentList:{
            list:[],
            load:false,
            reload:false,
            height:0
        },
        opt:{
            topicId:'',
            pages:0,
            paged:1,
            orderBy:'ASC',
            status:'publish'
        },
        smileShow:false,
        answer:{
            showSmile:false,
            uploadType:'',
            parent:1,
            image:{
                id:'',
                progress:0,
                success:false,
                url:'',
                ext:'',
                size:'',
                name:''
            },
            file:{
                ext:'',
                size:'',
                name:'',
                id:'',
                progress:'',
                success:false
            },
            content:''
        }
    },
    mounted(){
        this.single.is = this.$refs.circleSingle
        this.admin.is = this.$refs.circleAdmin
        if(this.single.is){
            this.single.id = this.$refs.circleSingle.getAttribute('data-id')
        }else if(this.admin.is){
            this.circleId = b2GetQueryVariable('circle_id')
            this.opt.status = 'pending';
        }else{
            if(!this.$refs.topicForm) return
            this.circleId = document.querySelector('.po-topic-textarea').getAttribute('data-circle')
        }
        this.getTopicList()
        autosize(this.$refs.topicForm)
        autosize(this.$refs.topicAnswer)
        var clipboard = new ClipboardJS('.fuzhi');
        clipboard.on('success', e=>{
            this.$toasted.show('复制成功',{
                theme: 'primary', 
                position: 'top-center', 
                duration : 4000,
                type:'error'
            })
        });
        clipboard.on('error', e=> {
            this.$toasted.show('请选中复制',{
                theme: 'primary', 
                position: 'top-center', 
                duration : 4000,
                type:'error'
            })
        });
    },
    created() {
        window.addEventListener('scroll', this.scroll)
    },
    methods:{
        scroll(){
            if(this.single.is) return
            //文档内容实际高度（包括超出视窗的溢出部分）
            var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
            //滚动条滚动距离
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            //窗口可视范围高度
            var clientHeight = window.innerHeight || Math.min(document.documentElement.clientHeight,document.body.clientHeight);
            
            if(clientHeight + scrollTop >= (scrollHeight - 850) && !this.locked){
                this.getTopicListMore()
            }
        },
        showCircleListBox(type){
            if(this.circle.showBox == type){
                this.circle.current = this.circle.picked.type
                this.circle.showBox = ''
            }else{
                this.circle.current = type
                this.circle.showBox = type
            }
        },
        pickedType(type){
            if(b2CirclePostBox.locked) return
            this.topicFliter.type = type
            this.setCommentBox()
            this.resetCommentBox()
            this.paged = 1
            this.getTopicList()
        },
        pickedOrder(type){
            if(b2CirclePostBox.locked) return
            this.topicFliter.orderBy = type
            this.setCommentBox()
            this.resetCommentBox()
            this.paged = 1
            this.getTopicList()
        },
        pickedRole(type){
            if(b2CirclePostBox.locked) return
            this.topicFliter.role = type
            this.setCommentBox()
            this.resetCommentBox()
            this.paged = 1
            this.getTopicList()
        },
        pickedFile(type){
            if(b2CirclePostBox.locked) return
            this.topicFliter.file = type
            this.setCommentBox()
            this.resetCommentBox()
            this.paged = 1
            this.getTopicList()
        },
        pickedCircle(type,id){
            if(b2CirclePostBox.locked) return
            this.circle.picked.type = type
            this.circle.picked.id = id
            this.circleId = id
            this.circle.showBox = false
            this.circle.current = type
            this.paged = 1
            this.resetFliter()
            this.setCommentBox()
            this.resetCommentBox()
            this.getTopicList()
        },
        resetFliter(){
            this.topicFliter.show = false
            this.topicFliter.type ='all'
            this.topicFliter.orderBy ='date'
            this.topicFliter.role ='all'
            this.topicFliter.file ='all'
        },
        getTopicListMore(){
            if(this.paged > this.pages) return
            if(this.reload === true) return
            this.reload = true
            this.paged++

            let data = {
                'paged':this.paged,
                'circle_id':this.circleId,
                'type':this.topicFliter.type,
                'order_by':this.topicFliter.orderBy,
                'role':this.topicFliter.role,
                'file':this.topicFliter.file,
                'status':this.admin.is ? 'pending' : ''
            }

            this.$http.post(b2_rest_url+'getTopicList',Qs.stringify(data)).then(res=>{
                if(res.data.data.length > 0){
                    let length = this.data.length
                    for (let i = 0; i < res.data.data.length; i++) {
                        this.$set(this.data,length+i,res.data.data[i])
                    }
                }

                this.reload = false
                this.$nextTick(()=>{
                    b2RestTimeAgo(document.querySelectorAll('.b2timeago'))
                    b2SidebarSticky()
                    lazyLoadInstance.update()
                })
               
            }).catch(err=>{
                this.reload = false
            })
        },
        getData(){
            this.$http.post(b2_rest_url+'getDataByTopicId','topic_id='+this.single.id).then(res=>{

                this.data = []
                this.$set(this.data,0,res.data)
                this.$nextTick(()=>{
                    b2RestTimeAgo(document.querySelectorAll('.b2timeago'))
                    lazyLoadInstance.update()
                    b2SidebarSticky()
                    this.showComment(0)
                })
               
            })
        },
        getTopicList(){

            if(this.single.is){
                this.getData()
                return
            }

            if(this.locked === true) return
            this.locked = true

            let data = {
                'paged':this.paged,
                'circle_id':this.circleId,
                'type':this.topicFliter.type,
                'order_by':this.topicFliter.orderBy,
                'role':this.topicFliter.role,
                'file':this.topicFliter.file,
                'status':this.admin.is ? 'pending' : ''
            }

            this.topicFliter.show = false

            this.$http.post(b2_rest_url+'getTopicList',Qs.stringify(data)).then(res=>{

                this.data = res.data.data
                this.pages = res.data.pages
                
                this.locked = false
                this.reload = false
                this.$nextTick(()=>{
                    this.$refs.listGujia.style.display = 'none'
                    b2RestTimeAgo(document.querySelectorAll('.b2timeago'))
                    b2SidebarSticky()
                    lazyLoadInstance.update()
                })
               
            }).catch(err=>{
                this.locked = false
            })
        },
        play(id,index){
            if(this.video.index === index && this.video.id === id){
                let video = document.querySelector('#video'+id+'i'+index)
                if(!this.video.action){
                    video.volume  = 0.5;
                    video.play()
                    this.video.action = true
                }else{
                    video.pause()
                    this.video.action = false
                }
            }else{
                if(this.video.id){
                    document.querySelector('#video'+this.video.id+'i'+this.video.index).pause()
                }
                let video = document.querySelector('#video'+id+'i'+index)
                video.volume  = 0.5;
                video.play()
                this.video.index = index
                this.video.id = id
                this.video.action = true
            }
        },
        watchVideo(video,id,index){
            video.addEventListener('ended', function () {  
                this.style.display = 'none';
            }, false);
        },
        playGif(ti,index){
  
            if(this.data[ti].attachment.image[index].play === 'play'){
                this.$set(this.data[ti].attachment.image[index],'play',false)
                this.$set(this.data[ti].attachment.image[index],'current',this.data[ti].attachment.image[index].gif_first)
            }else if(!this.data[ti].attachment.image[index].play){
                this.$set(this.data[ti].attachment.image[index],'play','loading')
                let img=new Image();
                img.onload=()=>{
                    this.$set(this.data[ti].attachment.image[index],'current',this.data[ti].attachment.image[index].thumb)
                    this.$set(this.data[ti].attachment.image[index],'play','play')
                };
                img.src=this.data[ti].attachment.image[index].thumb
            }
        },
        askContent(ti){
            let users = this.data[ti].data.data.users
            let usersHTML = '';
            if(users.length > 0){
                for (let i = 0; i < users.length; i++) {
                    usersHTML += '<a class="b2-color" href="'+users[i].link+'" target="_blank">'+users[i].name+'</a>，'
                }
                usersHTML = usersHTML.substr(0, usersHTML.length - 1)
            }else{
                usersHTML = '<b class="ask-all-users b2-color">'+b2_global.js_text.circle.all_users+'</b>'
            }

            return usersHTML
        },
        fliterContent(content){
            return '<p>' + content.replace(/\n*$/g, '').replace(/\n/g, '</p><p>') + '</p>'
        },
        showComment(ti){
            if(!this.changeTip() || this.admin.is) return

            this.restScroll(ti)

            if(this.data[ti].topic_id == this.opt.topicId){
                this.opt.topicId = ''
                this.commentBox.index = ''
                this.setCommentBox()
            }else{
                this.opt.topicId = this.data[ti].topic_id
                this.commentBox.index = ti
                this.setCommentBox('#comment-box-'+this.opt.topicId)
                this.getCommentList()
            }
 
            this.resetComment()
        },
        showChildComment(index,parent){
            if(!this.changeTip() || this.admin.is) return
            
            this.setCommentBox('#comment-box-at-'+parent)
            this.commentBox.childIndex = index

            this.commentBox.parent = parent
            this.resetComment(true)
        },
        setCommentBox(where){
            if(this.admin.is) return
            if(where){
                if(where.indexOf('#comment-box-at-') === -1){
                    this.commentBox.parent = ''
                }
                document.querySelector(where).appendChild(document.querySelector('#topic-comment-form'))
            }else{
                document.querySelector('#comment-form-reset').appendChild(document.querySelector('#topic-comment-form'))
            }
        },
        restScroll(ti){
            if(this.single.id) return
            if(this.commentBox.index !== '' && ti > this.commentBox.index){

                window.removeEventListener('scroll',window.bodyScrool,false)
                commentListHeight = document.querySelector('.circle-topic-item-'+this.opt.topicId+' .topic-comments').clientHeight
                window.scrollBy(0, -commentListHeight);
                setTimeout(() => {
                    window.addEventListener("scroll",window.bodyScrool , false);
                }, 500);
            }
        },
        resetCommentBox(){
            if(b2CirclePostBox.locked) return
            this.commentBox.index = ''
            this.commentBox.childIndex = ''
            this.commentBox.list = ''
            this.commentList.list = []
            this.commentList.height = 0

            this.opt = {
                topicId:'',
                pages:0,
                paged:1,
                orderBy:'ASC',
                satatus:this.admin.is ? 'pending' : ''
            }
        },
        resetComment(rePageNav){
            this.$refs.topicForm.value = ''
            this.$refs.topicForm.style.height = '40px'
            this.commentBox.img = ''
            this.commentBox.imgId = 0
            this.commentBox.showImgBox = false
            this.smileShow = false
            
            if(!rePageNav){
                this.opt.pages = 0
                this.opt.paged = 1
            }
        },
        getMoreCommentListData(data){
            this.setCommentBox('#comment-box-'+this.opt.topicId)
            this.commentBox.parent = ''
            this.commentBox.childIndex = ''

            this.commentList.height = document.querySelector('#comment-list-'+this.opt.topicId).clientHeight

            this.commentList.list = data.list
                
            this.opt.pages = data.pages
            this.commentList.load = false

            this.$nextTick(()=>{
                this.restCommontScroll()
                b2RestTimeAgo(document.querySelectorAll('#comment-list-'+this.opt.topicId+' .b2timeago'))
                this.rebuildZoom()
            })
            this.commentList.reload = false
        },
        getChildComments(index,parent){
            if(this.commentList.list[index].child_comments.locked === true) return
            this.$set(this.commentList.list[index].child_comments,'locked',true)

            this.$set(this.commentList.list[index].child_comments,'paged',this.commentList.list[index].child_comments.paged + 1)

            this.$http.post(b2_rest_url+'getChildComments','parent='+parent+'&paged='+this.commentList.list[index].child_comments.paged).then(res=>{

                this.commentList.list[index].child_comments.list = this.commentList.list[index].child_comments.list.concat(res.data.list)
                
                this.$set(this.commentList.list[index].child_comments,'locked',false)

                this.$nextTick(()=>{
                    b2RestTimeAgo(document.querySelectorAll('#comment-list-'+this.opt.topicId+' .b2timeago'))
                    this.rebuildZoom()
                })
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center',
                    duration : 4000,
                    type:'error'
                })
                this.$set(this.commentList.list[index].child_comments,'locked',false)
            })
        },
        rebuildZoom(){
            let imgList = document.querySelectorAll('#comment-list-'+this.opt.topicId+' .topic-commentlist-img-box img')
            for (let index = 0; index < imgList.length; index++) {
                b2zoom.listen(imgList[index]);
            }
        },
        restCommontScroll(){
            if(this.single.id) return
            window.removeEventListener('scroll',window.bodyScrool,false)
            let commentListHeight = document.querySelector('#comment-list-'+this.opt.topicId).clientHeight
            window.scrollBy(0, commentListHeight - this.commentList.height);
            setTimeout(() => {
                window.addEventListener("scroll",window.bodyScrool , false);
            }, 500);
        },
        changeTip(){
            if(this.single.is) return true
            if(this.$refs.topicForm.value.length > 0 || this.commentBox.img){
                if(!confirm(b2_global.js_text.circle.change_topic_form)){
                    return false
                }
            }
            return true
        },
        changeOrderBy(){
            this.commentList.reload = true
            if(this.opt.orderBy === 'DESC'){
                this.opt.orderBy = 'ASC'
            }else{
                this.opt.orderBy = 'DESC'
            }
            this.commentBox.parent = ''
            this.commentBox.childIndex = ''
            this.opt.paged = 1
            this.setCommentBox('#comment-box-'+this.opt.topicId)
            this.getCommentList()
        },
        getCommentList(){
            if(this.commentList.load == true) return
            this.commentList.load = true

            let data = {
                'topicId':this.opt.topicId,
                'paged': 1,
                'orderBy':this.opt.orderBy
            }
            this.$http.post(b2_rest_url+'getTopicCommentList',Qs.stringify(data)).then(res=>{

                this.commentList.list = res.data.list
                
                this.opt.pages = res.data.pages

                this.commentList.load = false
                this.commentList.reload = false

                this.$nextTick(()=>{
                    b2RestTimeAgo(document.querySelectorAll('#comment-list-'+this.opt.topicId+' .b2timeago'))
                    this.rebuildZoom()
                })
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.commentList.load = false
                this.commentList.reload = false
            })
        },
        vote(index,childindex,comment_id){

            let userData = userTools.userData
            if(!userData.user_link){
                login.loginType = 1
                login.show = true
                return
            }

            this.$http.post(b2_rest_url+'commentVote','type=comment_up&comment_id='+comment_id).then(res=>{
                if(childindex === ''){
                    this.$set(this.commentList.list[index].vote,'up',this.commentList.list[index].vote.up+res.data.comment_up)
                    if(res.data.comment_up === 1){
                        this.$set(this.commentList.list[index].vote,'picked',true)
                    }else{
                        this.$set(this.commentList.list[index].vote,'picked',false)
                    }
                }else{
                    this.$set(this.commentList.list[index].child_comments.list[childindex].vote,'up',this.commentList.list[index].child_comments.list[childindex].vote.up+res.data.comment_up)
                    if(res.data.comment_up === 1){
                        this.$set(this.commentList.list[index].child_comments.list[childindex].vote,'picked',true)
                    }else{
                        this.$set(this.commentList.list[index].child_comments.list[childindex].vote,'picked',false)
                    }
                }
                
            })
            
        },
        commentDisabled(){
            if(this.commentBox.locked == true || this.commentBox.imageLocked == true) return true
            return false
        },
        submitComment(){
            if(this.commentDisabled()) return
            this.commentBox.locked = true
            let data = {
                'comment_post_ID':this.opt.topicId,
                'comment':this.$refs.topicForm.value,
                'comment_parent':this.commentBox.parent,
                'img':{
                    'imgUrl':this.commentBox.img,
                    'imgId':this.commentBox.imgId
                }
            }

            this.$http.post(b2_rest_url+'commentSubmit',Qs.stringify(data)).then(res=>{
                
                if(this.commentBox.parent){
                    this.commentList.list[this.commentBox.childIndex].child_comments.list.push(res.data.list)
                }else{
                    this.commentList.list.unshift(res.data.list)
                }
                
                this.$nextTick(()=>{
                    if(this.commentBox.parent){
                        this.showChildComment(this.commentBox.childIndex,res.data.list.comment_ID)
                    }
                    b2RestTimeAgo(document.querySelectorAll('#topic-comment-'+res.data.list.comment_ID+' .b2timeago'))
                    document.querySelector('#topic-comment-'+res.data.list.comment_ID).classList += ' new-comment'
                })
                this.resetComment(true)
                this.commentBox.locked = false
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.commentBox.locked = false
            })
        },
        getFile(event){
            let file = event.target.files[0];
            if(!file || this.commentBox.imageLocked === true) return;
            this.commentBox.imageLocked = true
            let formData = new FormData()

            this.removeImage()
            this.commentBox.showImgBox = true

            formData.append('file',file,file.name)
            formData.append("post_id", this.opt.topicId)
            formData.append("type", 'circle')

            let config = {
                onUploadProgress: progressEvent=>{
                    this.commentBox.progress = progressEvent.loaded / progressEvent.total * 100 | 0
                }
            }

            this.$http.post(b2_rest_url+'fileUpload',formData,config).then(res=>{
                this.commentBox.progress = 'success'
                this.commentBox.img = res.data.url
                this.commentBox.imgId = res.data.id

                this.$refs.imageInput.value = ''
                this.commentBox.imageLocked = false
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.commentBox.progress = 'fail'
                this.$refs.imageInput.value = ''
                this.commentBox.imageLocked = false
            })
        },
        getAnswerFile(event,type){
            let file = event.target.files[0]
            if(!file || this.answer.uploadType !=='') return

            this.answer.uploadType = type

            this.answer[type].ext = b2CirclePostBox.fileExists(file.name)
            this.answer[type].size = b2CirclePostBox.readablizeBytes(file.size)
            this.answer[type].name = file.name

            if(type === 'image'){
                this.answer.image.url = window.URL.createObjectURL(file)
            }

            let formData = new FormData()

            formData.append('file',file,file.name)
            formData.append("post_id", this.answer.parent)
            formData.append("type", 'circle')

            let config = {
                onUploadProgress: progressEvent=>{
                    this.answer[type].progress = progressEvent.loaded / progressEvent.total * 100 | 0
                }
            }

            this.$http.post(b2_rest_url+'fileUpload',formData,config).then(res=>{

                if(type === 'image'){
                    this.answer.image.url = res.data.url
                    this.answer.image.id = res.data.id
                }else{
                    this.answer.file.id = res.data.id
                }

                this.answer[type].success = false
                this.answer.uploadType = ''
                this.answer[type].progress = 100
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary',
                    position: 'top-center',
                    duration : 4000,
                    type:'error'
                })
                this.answer[type].success = false
                this.answer.uploadType = ''
                this.answer[type].progress = 100
            })
        },
        removeImage(){
            this.commentBox.img = ''
            this.commentBox.imgId = 0
            this.commentBox.progress = 0
            this.commentBox.showImgBox = false
        },
        addSmile(val){
            grin(val,this.$refs.topicForm)
            this.smileShow = false
        },
        postVote(index,type,topic_id){
            let userData = userTools.userData
            if(!userData.user_link){
                login.loginType = 1
                login.show = true
                return
            }

            if(this.data[index].meta.vote.locked === true) return
            this.data[index].meta.vote.locked = true

            this.$http.post(b2_rest_url+'postVote','type='+type+'&post_id='+topic_id).then(res=>{

                this.$set(this.data[index].meta.vote,'up',this.data[index].meta.vote.up + res.data.up)
                this.$set(this.data[index].meta.vote,'down',this.data[index].meta.vote.down + res.data.down)

                if(res.data.up > 0){
                    this.$set(this.data[index].meta.vote,'isset_up',true)
                }else{
                    this.$set(this.data[index].meta.vote,'isset_up',false)
                }

                if(res.data.down > 0){
                    this.$set(this.data[index].meta.vote,'isset_down',true)
                }else{
                    this.$set(this.data[index].meta.vote,'isset_down',false)
                }

                this.$set(this.data[index].meta.vote,'locked',false)
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.$set(this.data[index].meta.vote,'locked',false)
            })
        },
        setSticky(topic_id,index){
            this.$http.post(b2_rest_url+'setSticky','topic_id='+topic_id).then(res=>{
                let text = b2_global.js_text.circle.set_sticky_success;
                if(res.data === false){
                    text = b2_global.js_text.circle.set_sticky_fail;
                    this.$set(this.data[index],'sticky',0)
                }else{
                    this.$set(this.data[index],'sticky',1)
                }
                this.$toasted.show(text, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            })
        },
        setBest(topic_id,index){
            this.$http.post(b2_rest_url+'setBest','topic_id='+topic_id).then(res=>{
                let text = b2_global.js_text.circle.set_best_success;
                if(res.data === false){
                    text = b2_global.js_text.circle.set_best_fail;
                    this.$set(this.data[index],'best',0)
                }else{
                    this.$set(this.data[index],'best',1)
                }
                this.$toasted.show(text, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            })
        },
        isAdmin(){
            return typeof b2CirclePostBox !== 'undefined' && (b2CirclePostBox.currentUser.isCircleAdmin || b2CirclePostBox.currentUser.isAdmin);
        },
        deleteTopic(index,topic_id){
            if(!confirm(b2_global.js_text.circle.delete_confirm)) return
            this.$http.post(b2_rest_url+'deleteTopic','topic_id='+topic_id).then(res=>{
                if(res.data == true){
                    this.$toasted.show(b2_global.js_text.circle.delete_success, { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })

                    this.data.splice(index,1)
                }else{
                    this.$toasted.show(b2_global.js_text.circle.delete_fail, { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })
                }
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            })
        },
        topicChangeStatus(index,topic_id){
            this.$http.post(b2_rest_url+'topicChangeStatus','topic_id='+topic_id).then(res=>{
                if(res.data){
                    this.$toasted.show(b2_global.js_text.circle.status_success, { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })

                    this.data.splice(index,1)
                }else{
                    this.$toasted.show(b2_global.js_text.circle.status_fail, { 
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })
                }
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, { 
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            })
        },
        showImageLight(ti,index){
            
            this.$set(this.data[ti].attachment,'Showimage',true)
            this.$set(this.data[ti].attachment,'imageIndex',index)
        },
        closeImageBox(ti){
            this.$set(this.data[ti].attachment,'Showimage',false)
        },
        getRotationAngle(target){
            const obj = window.getComputedStyle(target, null);
            const matrix = obj.getPropertyValue('-webkit-transform') || 
                obj.getPropertyValue('-moz-transform') ||
                obj.getPropertyValue('-ms-transform') ||
                obj.getPropertyValue('-o-transform') ||
                obj.getPropertyValue('transform');

            let angle = 0; 

            if (matrix !== 'none') 
            {
                const values = matrix.split('(')[1].split(')')[0].split(',');
                const a = values[0];
                const b = values[1];
                angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
            } 

            return (angle < 0) ? angle +=360 : angle;
        },
        rotate(type,ti){
            
            let id = this.data[ti].topic_id
            let box = document.querySelector('.circle-topic-item-'+id+' .image-show')
   
            //容器宽度
            let w = box.offsetWidth

            //当前状态
            let status = box.querySelector('.box-in').style.paddingTop

            let big_ratio = this.data[ti].attachment.image[this.data[ti].attachment.imageIndex].big_ratio
            let left_ratio = (1/big_ratio).toFixed(5)

            let _h,_w

            if(status == Calc.Mul(big_ratio,100)+'%'){
                box.querySelector('.box-in').style.paddingTop = Calc.Mul(left_ratio,100)+'%'
                _h = w
                _w = w/big_ratio
                
            }else{
                box.querySelector('.box-in').style.paddingTop = Calc.Mul(big_ratio,100)+'%'
                _w = w
                _h = w*big_ratio
            }

            let ratio = this.getRotationAngle(box.querySelector('img'))

            if(type === 'right'){
                ratio = ratio+90
            }else{
                ratio = ratio-90
            }

            if(ratio >= 360 || ratio <= -360) {
                ratio = 0
                box.querySelector('.box-in > img').style.transform = 'none'
            }else{
                box.querySelector('.box-in > img').style.transform = 'rotate('+ratio+'deg) '+this.reTransform(ratio)
            }

            box.querySelector('.box-in > img').style.width = _w+'px'
            box.querySelector('.box-in > img').style.height = _h+'px'
        },
        reTransform(ratio){
            if(ratio == 90){
                return 'translate(0, -100%)'
            }

            if(ratio == -90){
                return 'translate(-100%, 0)'
            }

            if(ratio == -180 || ratio == 180){
                return 'translate(-100%, -100%)'
            }

            if(ratio == 270){
                return 'translate(-100%, 0)'
            }
            
            if(ratio == -270){
                return 'translate(0, -100%)'
            }

            return 'translate(0, 0)'
        },
        imageNav(type,ti){
            let index = this.data[ti].attachment.imageIndex

            if(type === 'prev'){
                if(index == 0){
                    index = this.data[ti].attachment.image.length - 1
                }else{
                    index = index - 1
                }
            }else{
                if(index >= this.data[ti].attachment.image.length - 1){
                    index = 0
                }else{
                    index = index + 1
                }
            }

            this.$set(this.data[ti].attachment,'imageIndex',index)
        },
        answerAddSmile(val){
            grin(val,this.$refs.topicAnswer)
            this.answer.showSmile = false
        }
    },
    watch:{
        smileShow(val){
            if(val){
                this.commentBox.showImgBox = false
            }else if(this.commentBox.img){
                this.commentBox.showImgBox = true
            }
        },
        // 'admin.type':{
        //     handler(newVal, oldVal) {
        //         // if(newVal == 'users' && admin.userList === ''){
        //         //     this.getAdminList(this.circleId)
        //         // }
        //     },
        //     immediate: true,
        // }
    }
})

var b2CreateCircle = new Vue({
    el:'#create-circle',
    data:{
        tags:{
            status:'edit',
            picked:''
        },
        pay:{
            status:'hidden',
            type:'free',
        },
        role:{
            status:'hidden',
            money:{
                permanent:'',
                year:'',
                halfYear:'',
                season:'',
                month:'',
            },
            join:'free'
        },
        info:{
            status:'hidden',
            icon:'',
            cover:'',
            name:'',
            desc:'',
            slug:'',
            iconUpload:false,
            coverUpload:false
        },
        other:{
            status:'hidden'
        },
        locked:false
    },
    methods:{
        create(){
            let l = userTools.userData
            if(!l.user_link){
                login.show = true
                login.loginType = 1
            }else{
                window.location.href = b2_global.home_url+'/create-circle'
            }
        },
        edit(type){

            let arg = ['pay','info','role','tags']

            for (let i = 0; i < arg.length; i++) {
                if(type === arg[i]){
                    this[arg[i]].status = 'edit'
                }else{
                    if(this.checkForm(arg[i],true)){
                        this[arg[i]].status = 'finish'
                    }else{
                        this[arg[i]].status = 'hidden'
                    }
                }
            }
        },
        goNext(type){
            if(!this.checkForm(type)){
                return
            }

            if(type === 'pay'){
                type = 'role'
            }else if(type === 'role'){
                type = 'info'
            }else if(type === 'tags'){
                type = 'pay'
            }

            let arg = ['pay','info','role','tags']

            for (let i = 0; i < arg.length; i++) {
                if(type === arg[i]){
                    this[arg[i]].status = 'edit'
                }else{
                    if(this.checkForm(arg[i],true)){
                        this[arg[i]].status = 'finish'
                    }else{
                        this[arg[i]].status = 'hidden'
                    }
                }
            }
        },
        checkForm(type,ret){
            let status = false,text = ''
            if(type === 'pay'){
                if(!this.pay.type){
                    status = true
                    text = b2_global.js_text.circle.create_circle_pay_error
                }
            }else if(type === 'role'){
                if(this.pay.type === 'money'){
                    if(this.role.money.permanent === '' && 
                    this.role.money.year === '' &&
                    this.role.money.halfYear === '' &&
                    this.role.money.season === '' &&
                    this.role.money.month === ''
                    ){
                        status = true
                        text = b2_global.js_text.circle.create_circle_role_money_error
                    }
                }else{
                    if(!this.role.join){
                        status = true
                        text = b2_global.js_text.circle.create_circle_role_join_error
                    }
                }
            }else if(type === 'info'){
                if(this.info.icon == '' || this.info.cover == '' || this.info.name == '' || this.info.desc == ''){
                    status = true
                    text = b2_global.js_text.circle.create_circle_info_error
                }else if(this.info.name.length < 2 || this.info.name.length > 20){
                    status = true
                    text = b2_global.js_text.circle.create_circle_info_name_error
                    console.log(this.info.desc.length)
                }else if(this.info.desc.length < 10 || this.info.desc.length > 100){
                    status = true
                    text = b2_global.js_text.circle.create_circle_info_desc_error
                }
            }
            if(status){
                if(!ret){
                    this.$toasted.show(text, {
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })
                }
                return false
            }

            return true
        },
        getFile(event,type){
            let file = event.target.files[0];
            if(!file) return;

            
            this.info[type+'Upload'] = true

            let formData = new FormData()

            formData.append('file',file,file.name)
            formData.append("post_id", 1)
            formData.append("type", 'circle')

            this.$http.post(b2_rest_url+'fileUpload',formData).then(res=>{

                this.info[type] = res.data.url

                this.info[type+'Upload'] = false
                this.$refs[type+'Input'].value = null
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.info[type+'Upload'] = false
                this.$refs[type+'Input'].value = null
            })
        },
        submit(){

            if(!this.checkForm('info')) return
            if(this.locked === true) return
            this.locked = true

            let data = {
                tags:this.tags.picked,
                pay:this.pay,
                role:this.role,
                info:this.info
            }

            this.$http.post(b2_rest_url+'createCircle',Qs.stringify(data)).then(res=>{
                window.location.href = res.data
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.locked = false
            })
        }
    }
})

//所有圈子页面
var b2AllCircle = new Vue({
    el:'#all-circles',
    data:{
        tag:'',
        paged:1,
        list:'',
        locked:false
    },
    mounted(){
        if(!this.$refs.allCircle) return
        this.getList()
    },
    methods:{
        getList(){
            if(this.locked === true) return
            this.locked = true
            let data = {
                'tag':this.tag,
                'paged':this.paged
            }

            this.$http.post(b2_rest_url+'getAllCircleData',Qs.stringify(data)).then(res=>{
                this.list = res.data
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
                this.locked = false
            })
        },
        go(index){
            this.$scrollTo('#circle-'+index, 300, {offset: -80})
        }
    }
})

//所有用户
var b2AllUsers = new Vue({
    el:'#circle-users',
    data:{
        circleId:0,
        paged:1,
        list:'',
        follow:[],
        ids:[],
        opt:{
            paged:1,
            circleId:0
        }
    },
    mounted(){
        if(!this.$refs.allUsers) return
        this.opt.circleId = b2GetQueryVariable('circle_id')
        this.getList();
    },
    methods:{
        checkFollowByids(){
            let data = {
                'ids':this.ids
            }
            this.$http.post(b2_rest_url+'checkFollowByids',Qs.stringify(data)).then(res=>{
                this.follow = res.data
            })
        },
        followAc(id){
            let userData = userTools.userData
            if(!userData.user_link){
                login.show = true
            }else{
                this.$http.post(b2_rest_url+'AuthorFollow','user_id='+id).then(res=>{
                    this.follow[id] = res.data
                }).catch(err=>{
                    this.$toasted.show(err.response.data.message, {
                        theme: 'primary', 
                        position: 'top-center', 
                        duration : 4000,
                        type:'error'
                    })
                })
            }
        },
        dmsg(id){
            let userData = userTools.userData
            if(!userData.user_link){
                login.show = true
            }else{
                b2Dmsg.userid = id
                b2Dmsg.show = true
            }
        },
        getMoreUserListData(data){
            this.list = data
            for (let i = 0; i < this.list.list.length; i++) {
                this.ids.push(this.list.list[i].id)
            }
            this.checkFollowByids()
        },
        getList(){
            this.$http.post(b2_rest_url+'getCircleUserList','circleId='+this.opt.circleId+'&paged='+this.opt.paged).then(res=>{
                this.list = res.data
                this.opt.pages = res.data.pages
                for (let i = 0; i < this.list.list.length; i++) {
                    this.ids.push(this.list.list[i].id)
                }
                this.checkFollowByids()
            })
        },
        checkUser(id){
            this.$http.post(b2_rest_url+'changeUserRole','user_id='+id+'&circle_id='+this.opt.circleId).then(res=>{
                if(res.data == 1){
                    this.getList()
                }
            }).catch(err=>{
                this.$toasted.show(err.response.data.message, {
                    theme: 'primary', 
                    position: 'top-center', 
                    duration : 4000,
                    type:'error'
                })
            })
        }
    }
})