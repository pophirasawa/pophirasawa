---
title: c++ primer 读书笔记(1)
date: 2022-06-16 03:46:12
tags: 语言
categories:
- c++
---

> 
包含以下内容：
- 异常
- IO流
- 泛型

<!-- more -->

# 异常处理

## throw try catch

throw可以抛出异常。

try代码块后需要跟着catch代码块用于获取并处理抛出的异常。会进入第一个符合catch获取异常的代码块。

如果try语句有多层调用，会先找该层有没有适合的catch语句，再寻找上一层的，以此类推。如果都没有则会转到`terminate`的函数，导致程序非正常退出。

当然如果没有try还发生了异常会直接`terminate`。

```c++
try{
    throw runtime_error("RE");
} catch(runtime_error err){
    ...
}
```

## 标准异常库

定义了以下几种异常类型

| 异常类型         | 内容     |
| ---------------- | -------- |
| exception        | 常见异常 |
| runtime_error    | 运行时异常 |
| range_error      |  RE:结果超出了有意义的值域        |
| overflow_error   | RE:计算上溢         |
| underflow_error  | RE:计算下溢         |
| logic_error      |  逻辑错误        |
| domain_error     | LE:参数对应结果不存在         |
| invalid_argument | LE:无效参数         |
| length_error     |  LE:创建一个超出该类型最大长度对象        |
| out_of_range |LE:使用超出有效范围的值			|

除了exception,bad_alloc,bad_cast对象不能提供初始值，其他异常类型需要提供一个字符串(string/const char*)初始化，用于提供该异常的错误相关信息。

异常的what成员函数返回该字符串初始值。不能返回的由编译器决定内容。

# 调试帮助

## assert

assert是一个宏。

代码`assert(expr);`的行为是先对expr求值，若expr为假，则输出信息并终止程序，若为真则什么都不做。

如果使用了`#define`定义了`NDEBUG`，则assert什么都不做。

## 一些变量

`__func__`:当前调试的函数名

`__FILE++`：当前文件名的字符串字面值

`__LINE__`:当前行号的int

`__TIME__`:文件编译时间字符串字面值

`__DATE__`:文件编译日期字符串字面值

---

# IO

##   头文件

- `<iostream>`
- `<fstream>`
- `<sstream>`

流对象会有状态`iostate`。

`rdstate()`方法能获取流对象当前的状态。

`setstate()`设置状态

`good()`看流对象是否错误

`clear()`恢复错误状态

以及一堆东西用来管理。

## 缓冲区

输出流的内容可能会被输入到缓冲区中。等一个时间再写。

`endl`会插入一个换行然后刷新

`flush`刷新

`ends`插入一个空字符然后刷新

使用`unitbuf`操作符后会让流在之后的每次写操作后flush

用`nounitbuf`后恢复

## 关联

`tie()`方法传入一个类引用/指针。

如果输入流关联到输出流时，任何从输入流读数据的操作都会先刷新关联的输出流。

## 文件流

`fstream`

初始化`fstream fs(s,mode);`传入文件名s，打开为文件流。模式为mode，该参数可选。

`open()`方法，用fstream打开文件

`close()`方法，关闭文件流

`is_open()`方法，指出关联文件是否打开而且没有关闭。



`ifstream`和`ofstream`文件输入输出流。

如果`open()`失败了会置位`failbit`

可以直接`if(fs)`来检测是否打开成功。

## 流，文件模式

可以指定文件模式

| 文件模式 | 干嘛的                   |
| -------- | ------------------------ |
| in       | 读方式                   |
| out      | 写方式                   |
| app      | 写操作前定位到文件末尾   |
| ate      | 打开文件后定位到文件末尾 |
| trunc    | 截断文件                 |
| binary   | 二进制io                 |

- out模式只能设定给`ofstream`或者`fstream`

- in模式只能给`ifstream` `fstream`

- 没用`trunc`就可以用`app`

**用`ostream`打开文件时文件内容会被扔掉**

**除非指定app模式**

```c++
ofstream out("a.txt", ofstream::out | ofstream::app);
```

## sstream

`stringstream`用string初始化咯。

`str()`方法返回流保存string的拷贝

`str(s)`方法把s拷贝到流里边然后返回void

---

# 泛型

>  这部分感觉书的意思是stl风格的泛型算法？

## 谓词

> 谓词是一个可以调用的表达式，其返回结果是一个能作为条件的值。

stl中接受一元或者二元谓词。

举个例子，`sort()`函数的重载之一，接受的第三个参数就是谓词。

也就是`sort(it.begin(),it.end(),cmp)；`中的cmp就是一个二元谓词，其是一个比较函数，返回`bool`类型。

## lambda表达式

谓词接受的参数个数是严格确定的，但是有时候谓词的内容可能是高度相似的，这是重写多个谓词不太合理，又不能把这部分单独设置成一个函数参数，就该用lambda了。

```C++
//结构
[capture list](param list) -> return type {function body}
```

lambda表达式是一种可调用对象，函数，函数指针，以及重载了函数调用运算符的类也是可调用对象。

我们可以忽略参数列表和返回类型，但是**必须**包含捕获列表和函数体。

忽略返回类型的时候返回类型是自动推断的。

```c++
auto f = []{return -1;}
```

这时f就是一个可调用对象。

用`f();`来调用。

### 捕获列表

在捕获列表中添加变量名，lambda的函数体内才能访问这些变量。

```c++
	int a = 1;
	auto f = [a]() ->int {return a; };
	cout << f();
```

但是lambda的捕获列表是一如既往的延迟调用的。在定义的时候就复制了一份捕获列表内容。

```c++
	int a = 1;
	auto f = [a]() ->int {return a; };
	a=2;
	cout << f();
//依旧输出a
```

把列表内改为引用可以很显然地解决这个问题。

还有一些更抽象的用法（隐式捕获）：

- [=]可以捕获所有的变量
- [&]可以捕获所有变量的引用

f可以在别的函数里边定义：

```c++

template <typename T>
int func(T t) {
	return int(t());
}
int main() {
	ios::sync_with_stdio(0);
	int a = 1;
	auto f = [&a] {return a; };
	cout<<func(f);
	a = 2;
	cout << func(f);
}
//输出1，2
```

### 可变lambda

要是想改变捕获的被拷贝的变量，要加上mutable关键字。

```c++
int a = 0;
auto f = [a] () mutable {return ++a;}
a = 10;
f();//这时返回1，参数列表里边的a作为被拷贝变量被保存了。
```

感觉这个时候捕获列表复制之后，就变成了一个同名的作用域不一样的局部变量？



lambda就是可以就地声明匿名函数，让调用更加方便了！

当然新写一个class重载`()`操作符搞一个仿函数也是一样的效果，大概。

## bind函数

`bind`函数被定义在`<functional>`内。

作用是接受一个可调用对象以及一个参数列表，生成一个新的可调用对象来适应这些参数列表。

```c++
auto newCallable = bind(callable , arg_list);
```

相当于调用`newCallable`的时候这玩意把`arg_list`里的参数传给`callale`

`_n`占位符意味着`newCallable`里的第n个参数。

`_n`被定义在`std::placeholders`命名空间里边。

```c++
auto f1 = [](int a,int b){
    return a-b;
}
auto f2 = bind(f1,2,_1);
f(1);//返回2-1=1
```

## 迭代器

io流也有迭代器。

`istream_iterator`和`ostream_iterator`

## 泛型！

要构造支持很多种类型的泛型算法，就需要用到迭代器，迭代器抽象了那些访问读写操作，程序只需要操作迭代器而不用关心传入的东西的类型。

- 输入迭代器(==,!=,++,*,->)
- 输出迭代器(++,**)
- 前向迭代器(支持多次扫描)
- 双向迭代器(支持正反读写,--)
- 随即访问迭代器(支持随即访问,能比较两个迭代器位置关系,+=，+，-，-=，下标[]等)

### 算法命名规范

除了传入首尾迭代器以外

**使用重载来加入一个谓词参数**：

```c++
sort(beg, end);
sort(beg, end, comp);
```

**_if版本**

```c++
find(beg, end, val);
find_if(beg, end, perd);//第一个perd为真
```

**_copy版本**

用于区分拷贝版和非拷贝版本
