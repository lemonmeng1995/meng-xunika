<template>
    <div class='active'>
        <van-image  :src="beijing" />
        <div class='noyice'>
            <p v-html="dataNotice.notice_text" class="explain"></p>
        </div>

    </div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
import {Toast} from 'vant';
export default {
    data(){
        return{
            dataNotice:{},
            beijing: require("../../assets/v3v1active.png"),
        }
    },
     mounted() {
        let activeId = this.$store.state.activeId
        let activity_id = aes_encryptObject({ activity_id: activeId });
        this.$http.get("/exchanges/get-notice-info", { params: activity_id })
            .then(res => {
                if(res.data.code == 0 && res.data.success){
                    this.dataNotice = res.data.data
                }else{
                    Toast(res.data.msg);
                }
            })

     }
    
}
</script>

<style scoped lang="scss">
.active{
    width:100%;
    position: relative;
    .van-image{
        position: fixed;
        height:auto;
        width:100%;
        display: block;
        font-size: 0;
    }
    .noyice{
         padding-top:300px;
        .explain {
        max-height: 93%;
        overflow-y: scroll;
        text-align: left;
        padding:20px;
    }

    }
}

</style>