---
title: Mysql8迁移至Mariadb
date: 2023-07-02 00:00:00
tags:
  - 数据库
---
## 问题定位
朋友找到我, 说服务器上的Mysql在宕机后出现问题, 想让我帮忙看看, 具体错误日志如下
<!-- more -->
```log
2023-07-02T07:28:31.633124Z 0 [System] [MY-010116] [Server] C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe (mysqld 8.0.33) starting as process 21344
2023-07-02T07:28:31.660800Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2023-07-02T07:28:33.398409Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2023-07-02T07:28:33.791414Z 0 [System] [MY-010229] [Server] Starting XA crash recovery...
2023-07-02T07:28:33.794059Z 0 [System] [MY-010232] [Server] XA crash recovery finished.

InnoDB: Progress in percents: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100
2023-07-02T07:28:33.909793Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.
2023-07-02T07:28:33.910106Z 0 [System] [MY-013602] [Server] Channel mysql_main configured to support TLS. Encrypted connections are now supported for this channel.
2023-07-02T07:28:33.930909Z 0 [System] [MY-011323] [Server] X Plugin ready for connections. Bind-address: '::' port: 33060
2023-07-02T07:28:33.930963Z 0 [System] [MY-010931] [Server] C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe: ready for connections. Version: '8.0.33'  socket: ''  port: 3306  MySQL Community Server - GPL.
2023-07-02T07:28:42Z UTC - mysqld got exception 0xc0000005 ;
Most likely, you have hit a bug, but this error can also be caused by malfunctioning hardware.
Thread pointer: 0x17041543570
Attempting backtrace. You can use the following information to find out
where mysqld died. If you see no messages after this, something went
terribly wrong...
7ff60e060a7a    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e060bf1    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e0a7315    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e066ce9    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e069779    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dface00    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dfadf39    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dfb6d8b    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dee6a26    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dee60b4    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60dfb8150    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e07abac    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e07a474    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e079ead    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e075a0c    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60e07bab6    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60df4f9f0    mysqld.exe!?deallocate@?$allocator@V?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@std@@@std@@QEAAXQEAV?$sub_match@V?$_String_const_iterator@V?$_String_val@U?$_Simple_types@D@std@@@std@@@std@@@2@_K@Z()
7ff60ddfd778    mysqld.exe!?open@Zstd_dec@compression@transaction@binary_log@@UEAA_NXZ()
7ff60cd07b33    mysqld.exe!?ha_write_row@handler@@QEAAHPEAE@Z()
7ff60d1eb68c    mysqld.exe!?write_record@@YA_NPEAVTHD@@PEAUTABLE@@PEAVCOPY_INFO@@2@Z()
7ff60d1e811e    mysqld.exe!?execute_inner@Sql_cmd_insert_values@@MEAA_NPEAVTHD@@@Z()
7ff60cfda982    mysqld.exe!?execute@Sql_cmd_dml@@UEAA_NPEAVTHD@@@Z()
7ff60ced561a    mysqld.exe!?mysql_execute_command@@YAHPEAVTHD@@_N@Z()
7ff60d05e8c8    mysqld.exe!?execute@Prepared_statement@@AEAA_NPEAVTHD@@PEAVString@@_N@Z()
7ff60d05ecc6    mysqld.exe!?execute_loop@Prepared_statement@@QEAA_NPEAVTHD@@PEAVString@@_N@Z()
7ff60d060d13    mysqld.exe!?mysqld_stmt_execute@@YAXPEAVTHD@@PEAVPrepared_statement@@_NKPEAUPS_PARAM@@@Z()
7ff60cecec81    mysqld.exe!?dispatch_command@@YA_NPEAVTHD@@PEBTCOM_DATA@@W4enum_server_command@@@Z()
7ff60ced07a6    mysqld.exe!?do_command@@YA_NPEAVTHD@@@Z()
7ff60ccfb458    mysqld.exe!?thread_id@THD@@QEBAIXZ()
7ff60e317029    mysqld.exe!?my_init_dynamic_array@@YA_NPEAUDYNAMIC_ARRAY@@IIPEAXII@Z()
7ff60dd93a8c    mysqld.exe!?my_thread_self_setname@@YAXPEBD@Z()
7fff715c6b4c    ucrtbase.dll!_recalloc()
7fff728c4ed0    KERNEL32.DLL!BaseThreadInitThunk()
7fff73d8e20b    ntdll.dll!RtlUserThreadStart()

Trying to get some variables.
Some pointers may be invalid and cause the dump to abort.
Query (17065eb0370): INSERT INTO co_block (time, user, wid, x, y, z, type, data, meta, blockdata, action, rolled_back) VALUES (1688282922, 6, 1, -464, 66, 384, 4, 0, NULL, '14,15,8,9,10,11,12', 0, 0),(1688282922, 6, 1, -464, 66, 384, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, 592, 79, 1201, 4, 0, NULL, '6,7,8,9,10,11,12', 0, 0),(1688282922, 6, 1, 592, 79, 1201, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, 593, 79, 1201, 4, 0, NULL, '14,15,8,9,10,11,12', 0, 0),(1688282922, 6, 1, 593, 79, 1201, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, -1362, 71, 2254, 4, 0, NULL, '6,7,17,18,10,19,20', 0, 0),(1688282922, 6, 1, -1362, 71, 2254, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, -6281, 64, -4001, 4, 0, NULL, '6,7,17,18,10,19,20', 0, 0),(1688282922, 6, 1, -6281, 64, -4001, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, -6281, 64, -4002, 4, 0, NULL, '14,15,17,18,10,19,20', 0, 0),(1688282922, 6, 1, -6281, 64, -4002, 5, 0, NULL, '13', 1, 0),(1688282922, 6, 1, -470, 95, 254, 4, 0, NULL, '6,7,8,9,10,11,12', 0, 0)
Connection ID (thread ID): 40
Status: NOT_KILLED

The manual page at http://dev.mysql.com/doc/mysql/en/crashing.html contains
information that should help you find out what is causing the crash.
```
根据日志可知, mysql的版本是8.0.33社区版, 是在向表`co_block`批量插入数据时出现错误
第一反应是该表文件出现故障, 就向配置文件中的`mysqld`项下加入`innodb_force_recovery=1`, 把数据备份并把该表移除并重建
操作完成后, 认为问题应该解决了, 在开启数据库后马上又挂了, 问题依旧
随后在上述日志中注意到以下内容
```log
7ff60ddfd778    mysqld.exe!?open@Zstd_dec@compression@transaction@binary_log@@UEAA_NXZ()
```
又认为是binlog文件损坏, 又在数据库执行以下内容
```sql
reset master; --- 清空所有binlog从头开始计数
```
尝试后发现问题依旧, 于是在配置中加入`skip_log_bin`关闭binlog并启动服务
在确认binlog关闭后, 数据库服务还是崩溃了, 并且错误日志依旧
于是定位到代码[libbinlogevents/src/compression/zstd_dec.cpp#L50](https://github.com/mysql/mysql-server/blob/mysql-8.0.33/libbinlogevents/src/compression/zstd_dec.cpp#L50)
确认到是初始化zstd压缩失败, 查看[该文件提交日志](https://github.com/mysql/mysql-server/commits/mysql-8.0.33/libbinlogevents/src/compression/zstd_dec.cpp)了解到mysql8.0.33默认启用zstd压缩代替了lz4
排除了数据文件损坏的原因后, 确定是mysql社区版的程序问题, 重心从修复数据文件的方向转变成程序替换
在重装与降级mysql后发现问题依旧, 只好尝试使用其他兼容mysql的发行版
## 迁移
由于使用的mysql8, 为了兼容性本来打算使用percona8
但是由于服务器环境是Windows Server, 而percona没有提供Windows版本
并且根据程序内容判断, 是没有使用mysql8新特性
于是决定使用mysql之父另起炉灶的mariadb
而mariadb相当于mysql5.7, 从mysql8降级到mysql5.7还是存在一些需要处理的内容
### 1. 导出数据
旧数据库服务配置加入`innodb_force_recovery=1`后重新启动服务, 将所有数据表导出为sql文件
### 2. 处理数据
mysql8使用`utf8mb4_0900_ai_ci`作为默认字符串编码格式
而mysql5.7环境下不存在该格式, 在sql文件中将其替换为`utf8mb4_general_ci`
### 3. 安装Mariadb并导入数据
在mariadb首页下载了推荐的版本11.0.2.GA并安装, 使用mysql8原账号密码与端口号启动
在mariadb中执行导出的sql文件, 成功将所有数据导入到mariadb
本以为到此处问题已经解决, 启动应用后却出现了新状况, 控制台输出如下
```log
java.sql.SQLException: Unknown system variable 'transaction_isolation'
    at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:130) ~[mysql-connector-j-8.0.33.jar:8.0.33]
    at com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:122) ~[mysql-connector-j-8.0.33.jar:8.0.33]
    at com.mysql.cj.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:825) ~[mysql-connector-j-8.0.33.jar:8.0.33]
    at com.mysql.cj.jdbc.ConnectionImpl.<init>(ConnectionImpl.java:446) ~[mysql-connector-j-8.0.33.jar:8.0.33]
    at com.mysql.cj.jdbc.ConnectionImpl.getInstance(ConnectionImpl.java:239) ~[mysql-connector-j-8.0.33.jar:8.0.33]
    at com.mysql.cj.jdbc.NonRegisteringDriver.connect(NonRegisteringDriver.java:188) ~[mysql-connector-j-8.0.33.jar:8.0.33]
```
问题在于mysql8将`tx_isolation`重命名为`transaction_isolation`
但是经过查询[mysql-connect-j:8.0.33的源码](https://github.com/mysql/mysql-connector-j/blob/8.0.33/src/main/user-impl/java/com/mysql/cj/jdbc/ConnectionImpl.java#L584)确认该版本是向下兼容旧命名的
随后在各大开发社区上查询, 在该[issue](https://github.com/SkytAsul/JukeBox/issues/48#issuecomment-1605280097)中确认是mariadb的版本问题, 至于具体是什么原因暂未细究
将mariadb-11.0.2.GA卸载, 安装mariadb-11.1.1.RC, 并重新导入数据后问题成功解决