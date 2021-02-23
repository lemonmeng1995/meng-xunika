import router from "./router";
import store from "./store";
import http from "./utils/http.js";
import { getrq,aes_encryptObject} from "@/api/encryption";
const title = "";
let activeId ='';
function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle}`;
  }
  return title;
}
const whiteList = ["/Err"];
const AnnouncList = ["/v3/activityAnnounc","/ActivityAnnounc"];
router.beforeEach(async (to, from, next) => {
  const isParam = to.query;
  if (isParam && JSON.stringify(isParam) !== "{}") {
    var rq = getrq(isParam.rq);
    activeId = rq.activity_id;
    store.commit("SET_ACTIVEID", activeId);
    store.commit("SET_URLRQ", "?rq=" + isParam.rq);
    //判断页面跳转，调用接口是否开启公告
    let activity_ids = aes_encryptObject({ activity_id: activeId });
      if(to.path !='/' && to.path != '/v3/explain'){
        http.get("/exchanges/get-notice-info", { params: activity_ids }).then(res => {
          if(res.data.code == 0 && res.data.success){
              let dataNotice = res.data.data
              if(dataNotice.is_notice == 1){
                if(to.path.indexOf('v3') != -1){
                  if (AnnouncList.indexOf(to.path) !== -1) {
                    next();
                  }else{
                    next({
                      name: "v3ActivityAnnounc",
                      query:to.query
                    });
                  }
                }else{
                  if (AnnouncList.indexOf(to.path) !== -1) {
                    next();
                  }else{
                    next({
                      name: "ActivityAnnounc",
                      query:to.query
                    });
                  }
                }
              }else {
                next()
              }
          }else{
              next()
          }
       })
      }else{
        next()
      }
  } else {
    if (from.query && JSON.stringify(from.query) !== "{}" && from.query.rq) {
      next({
        path: to.path,
        query: from.query
      });
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next({
          name: "Err"
        });
      }
    }
  }
  if (
    localStorage.getItem(`pageTitle_${activeId}`) &&
    typeof localStorage.getItem(`pageTitle_${activeId}`) != "undefined"
  ) {
    document.title = getPageTitle(localStorage.getItem(`pageTitle_${activeId}`));
  } else {
    document.title = getPageTitle(title);
  }
});
