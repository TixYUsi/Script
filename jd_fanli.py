    printf(r.json()["content"]["msg"])


if __name__ == '__main__':
    try:
        cks = os.environ["JD_COOKIE"].split("&")
    except:
        f = open("/jd/config/config.sh", "r", encoding='utf-8')
        cks = re.findall(r'Cookie[0-9]*="(pt_key=.*?;pt_pin=.*?;)"', f.read())
        f.close()
    for ck in cks:
        ptpin = re.findall(r"pt_pin=(.*?);", ck)[0]
        printf("--------开始京东账号" + ptpin + "--------")
        try:
            count = getTaskFinishCount(ck)
            if count["finishCount"] < count["maxTaskCount"]:
                for times in range(count["maxTaskCount"] - count["finishCount"]):
                    tasks = getTaskList(ck)
                    for i in tasks:
                        if i["statusName"] != "活动结束":
                            printf("开始做任务：" + i["taskName"])
                            uid, tt = saveTaskRecord(ck, i["taskId"], i["taskType"])
                            time.sleep(10)
                            saveTaskRecord1(ck, i["taskId"], uid, tt, i["taskType"])
                            
        except:
            printf("发生异常错误")
