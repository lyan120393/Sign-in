# Sign-in Project

Sign-in Project for members who work in Popo

Todo List:

3.  签到签出页面 归纳为 personal page.
    签入按钮
    签出按钮
    小吃,饮料, note 的显示.
4.  用户个人页面
    修改密码
5.  查询页面
    查询工作记录, 统计结果等等

6.  数据统计的路由
    根据某一段时间的进行统计, 统计工作时间, 统计小吃.
7.  服务器功能待更新
    3.  账号权限检查, 如果是 Manager 账号,可以查看更多的内容(所有员工的记录, 手动修改时间的记录,更多功能待补充)
    4.  员工账号只能查看自身的工作时间, 无法查看其他人的时间记录.
    5.  时间预测(客户端 Js), 通过当前的时间, 选择最接近的 5 的倍数的时间.
    6.  统计功能, 统计指定时间内的工作时长, 小吃, 饮料等内容.
    7.  时间自动终止功能, 防止忘记 signOut 造成错误.
    8.  所有被人为手动调整过时间的记录, manual 的布尔值都设置为 true, 证明被修改过.
    9.  留言板功能, 分为员工留言板和 manager 留言板.
    10. 查看本周总班表----当前需要手动输入每个人的工作时长.(未来可能考虑使用电脑排班)
    11. 下次工作时段提醒, 显示下次自己需要工作的时间段.
    12. \*GPS 地理位置范围判断, 这个功能在研究下怎么弄.
    13. \*仓库拿货, 超市扫货, 送餐派送的统计.
    14. 商店参数需要写到程序当中.

next todo:

1. - [x]留言板路由

   1. - [x]创建一个店铺的模型
      1. 包含字段: 店铺名称(区别于 moscow 店), 营业时间开始于结束(用于自动签出), GPS 和阈值暂时不写因为还不知道怎么写, 留言板( manager, kitchen, front, 需要包含签到时间和文本和谁留的言), 本周员工总体班表(), 店铺排班相关的暂时不写, 店铺缺货列表(未来等开发到这个功能)), 店铺的各种配方的谁知道如何制作.
   2. - [x]创建一个新店铺的实例
   3. - [x]可以让具有权限的员工去进行修改留言板的内容, 保留编辑时间和编辑员工.
      - [x]添加新的用户字段, belongStore, 用于区分员工所属于哪一个商店.
      - []目前没有写路由用于设置员工的所属商店, 存储的是商店的 id, 所以都是通过手动方式去给用户设定所属商店.
   4. - [x]读取, 修改留言的内容, 根据权限.都可以读取.
      - [x]但是修改时需要权限的.

2. 下次工作时段提醒路由 [暂时不觉得这个功能有多么的实在, 延后开发]

   1. 从店铺实例当中获得本周的总班表
      - []创建一个可以提交的本周总班表的路由, 如果可能的话存成数组(可以存放很多周的班表以供以后查看)
   2. 从总班表当中找到自己的班表,
   3. 根据此时此刻的日期推算出距离下次工作最近的 moment 数字,
   4. 然后把得到的数字渲染出去.(每次 request, 就会更新一次下次的工作时间.)
   5. 如果当前的时间位于工作时段之间, 则显示 工作中...
   6. 如果当前的时间超过某一个工作时段的截止时间, 显示下一次可用的工作时段.

2018/8/31

1. 完成留言板的全部路由

   1. - [x]留言板路由
      1. - [x]创建一个店铺的模型
         1. 包含字段: 店铺名称(区别于 moscow 店), 营业时间开始于结束(用于自动签出), GPS 和阈值暂时不写因为还不知道怎么写, 留言板( manager, kitchen, front, 需要包含签到时间和文本和谁留的言), 本周员工总体班表(), 店铺排班相关的暂时不写, 店铺缺货列表(未来等开发到这个功能)), 店铺的各种配方的谁知道如何制作.
         2. - [x]创建一个新店铺的实例
         3. - [x]可以让具有权限的员工去进行修改留言板的内容, 保留编辑时间和编辑员工.
         - [x]添加新的用户字段, belongStore, 用于区分员工所属于哪一个商店.
         - []目前没有写路由用于设置员工的所属商店, 存储的是商店的 id, 所以都是通过手动方式去给用户设定所属商店.
         4. - [x]读取, 修改留言的内容, 根据权限.都可以读取.
         - [x]但是修改时需要权限的.

2. - [x]修改 signIn 和 signOut 成功之后返回的 message 信息内容.
3. - [x]修改 resign 连接 和 edit 路由, 一旦被用户手动设置过, 需要把 manualEdit 字段设置为 true.
4. - []创建新的路由, 用于接收班表
   1. - []字段信息, 本周周一的日期(通常讲 Monday, 用于匹配对应的周), 用户名, 工作日是一个数组,包含最多 7 个元素,每个元素是一天(星期几(可以是数字, 也可以是文字), 开始时间( HH:mm), 结束时间( HH:mm)))
5. - []创建班表查询路由, 根据用户名称, 或者是本周开始的日期查看个人整周班表,以及所有人的整周班表.

2018/8/26

1. fix login and register page's Unexplected token problems
2. make javascript run when page loading
3. receive token from server, send token cross different page, and send token back to receive correct result,
4. finish design personal page"
5. 账号激活, 账号需要激活之后才能够登录
6. 账号登录成功之后, 才会发 Token, 注册完不发 Token. 如果未激活,无法成功登陆,并提示.
7. 注册页面完成.
8. 注册成功后的等待页面完成.

2018/8/22:
/\*
增删改查

1. 增
   当日增加:签到签出(标准常规签到)
   补签:过去日期的补签 (提供签到时间, 签出时间, 小吃, 饮料, note )直接操作数据库签到.补签需要带有一个记录.
2. 删除
   删除指定日期的工作记录(提供签到日期),根据签到日找到当天的记录进行删除
3. 改 /edit
   修改指定日期(提供日期), 查询当日是否有签到记录.
   如果有记录,根据日期进行修改.
   如果没有告诉没有记录无法修改.
4. 查询
   查询某日的工作记录(使用/ editcheck 路由)
   查询某段时间的工作记录(工作这里)
   输入肯定是两个时间点, 计算包含这两个时间点以及在他们之间的时间点的元素.
   \*/
