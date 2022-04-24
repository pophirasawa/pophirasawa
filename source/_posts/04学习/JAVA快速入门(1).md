---
title: JAVA快速入门(1)
date: 2022-04-25 04:30:00
tags: 语言
categories:
- JAVA
---

# 0. 引言

为了应付大作业，特地速成一哈JVAV

省略了一堆东西

估计过几天会继续写后篇，到时候再看吧。

内容包括

- 语法快速入门（这玩意和cpp大部分很像所以没咋写）
- 面向对象基础
- 杂项
- 一些核心类
- ？
<!-- more -->

---

# 1. 声明

### 和cpp不同的部分

```java
int[] a = new int[5];	//数组
var a = new int[5];		//自动类型推导
```

ps.

**任何数组都是引用类型！**

**string也是！**

**实例化的对象也是！**

这时候要判断是不是相等要用

`a.equals(b)`的方法

这个时候赋值是引用类型参数绑定

感觉有点像指针。。还有那个python的原理

---

## 2. 方法

### 可变参数

类似函数传入数组，用`类型...`定义

```java
class Group {
    private String[] names;

    public void setNames(String... names) {
        this.names = names;
    }
}
```

传入可以直接传入多个string



### 构造方法

类构造时调用的方法	~~构造函数~~

可以重载

```java
class Group {
    public Group{}
}
```



### 实例化

```java
A a = new A();
```

----

# 3. 类的一些东西

### 继承

java是单继承的，用`extends`关键字

```java
class B extends A{
}
```

经典`protected`类型，令子类可以访问父类的内容

**很显然，子类不应该定义和父类重名的字段，private也不行**



### super

`super`代表了父类，`super();`即父类的构造方法

实例化类的时候，会默认调用一个无参的`super();`

如果此时父类没有无参构造方法会报错

解决方法是手动在类构造函数上加一句父类对应的`super(xxxx);`

**子类不会继承任何父类的构造方法**



### 阻止继承

感觉暂时用不上

```java
public sealed class A permits B, C {
}
```

用`sealed`和`permits`可以让只有指定的类才能继承该类



### 上/下转型

**继承树object>a>b**

向上：

直接用引用变量指向子类实例就行

```java
A a = new B();
```

向下：

父类类型强转到子类类型

```java
A a = new B();
B b = new B();
b = (B)a;
```

`instanceof`为操作符，判断一个东西是不是指定类型

```java
Object obj = "hello";
if (obj instanceof String) {
    String s = (String) obj;
}
//或者可以直接一起转型
Object obj = "hello";
if (obj instanceof String s) {// 可以直接使用变量s            
	System.out.println(s.toUpperCase());
}
```



这种转型有时候我们在方法中传递形参为父类，又想调用子类的方法时，在确定了传入实参为子类后可以进行一个强转。



# 4. 多态

### override

首先说明方法签名：

- 方法名
- 参数列表

如果子类的一个方法方法签名和父类的完全一致，则子类会覆写父类的方法

使用`@Override`修饰，编译器还会帮助检查是否为覆写而非重载

`@Override`并非必须

**java调用方法时根据的是对象真正的类型而不是引用的类型进行调用**



### 多态

> 多态是指，针对某个类型的方法调用，其真正执行的方法取决于运行时期实际类型的方法

如果调用父类被覆写了的方法

可以使用`super.方法名()`来调用

`final` 感觉类似const

final修饰的类无法继承，final修饰的方法不会被覆写，final修饰的变量初始化之后无法更改



### 抽象类

类似cpp里边的虚函数，其实就是父类单纯提供方法签名而不实现任何功能，即抽象方法的时候用的。

这样就能构成多态。

使用`abstract	`修饰就完了，定义了抽象方法的类也要一样地修饰，这就是抽象类

~~和cpp一样~~抽象类无法实例化

```java
abstract class Person {
    public abstract void run();
}
```



所有这些东西的主要思想其实就是呃（抄的）

- 上层代码只定义规范（例如：`abstract class Person`）；
- 不需要子类就可以实现业务逻辑（正常编译）；
- 具体的业务逻辑由不同的子类实现，调用者并不关心。

----

# 5. 接口

### 接口本质是更抽象的抽象类

如果一个抽象类没有字段，所有方法全部都是抽象方法，就可以用接口改写。

使用`interface`声明，这里边的东西直接默认是`public abstract`

```java
interface A {
    void run();
    String asdf();
}
```

那么我们该如何使用这玩意呢

使用`implements`实现,

而且一个类可以实现多个接口

```java
class Student implements Person, Hello { // 实现了两个interface
    ...
}
```



### 有关接口继承

这玩意看着好复杂....

一个`interface`可以继承自另一个`interface`。`interface`继承自`interface`使用`extends`，它相当于扩展了接口的方法。

我们还可以定义`default`方法，

这个相当于抽象类中有具体实现的那些方法。

这样继承这个接口的所有子类也可以直接用这个方法。

```java
interface A {
    void run();
    default String asdf();
}

class B implements A{
    void run(){
        asdf();
    }
}
```

---

# 6. 一些杂项

### 静态字段

**静态字段啥的跟cpp类里边的差不多，静态方法是可以直接用方法名调用，类似正常的函数，但是他显然不能访问实例的非静态字段**

使用`static`修饰，懂得都懂（



### 包

~~类似命名空间~~

> Java定义了一种名字空间，称之为包：`package`。一个类总是属于某个包，类名（比如`Person`）只是一个简写，真正的完整类名是`包名.类名`。

位于同一个包的类，可以访问包作用域的字段和方法。不用`public`、`protected`、`private`修饰的字段和方法就是包作用域。



### import

使用`import`语句，导入包中的类或者子包

在写`import`的时候，可以使用`*`，表示把这个包下面的所有`class`都导入进来（但不包括子包的`class`）

还有一种`import static`的语法，它可以导入可以导入一个类的静态字段和静态方法。



### 作用域

感觉不用写。

一个是java支持嵌套类，内部的类也可以访问``private`



### 内部类

嵌套类，可以声明可以匿名

在方法内部定义一个匿名类，这玩意其实就是一个东西继承自某个父类，然后重写一下里边的方法？

```
Runnable r = new 父类类名() {
    // 实现必要的抽象方法...
};
```



### classpath和jar

~~不会~~

jar包相当于zip包，其实就是把编译好的一堆`.class`文件打包到一起便于管理



### 模块

应该是依赖管理之类的，懒得看了

----

# 7. JAVA的一些核心类

> 怎么都nm4点了，写完这段歇了（

### String

```java
String s = "eee";
```

**首字母大写（**

`String`不可变

由于是**引用**类型，我们要用`s1.equals(s2)`这种来判断是否相同

`equalsIgnoreCase()`方法忽略大小写比较

一堆方法啊。。

直接抄了。

```java
// 是否包含子串:
"Hello".contains("ll"); // true

"Hello".indexOf("l"); // 2
"Hello".lastIndexOf("l"); // 3
"Hello".startsWith("He"); // true
"Hello".endsWith("lo"); // true

"Hello".substring(2); // "llo"
"Hello".substring(2, 4); //"ll"
// 使用trim()方法可以移除字符串首尾空白字符。空白字符包括空格，\t，\r，\n：
"  \tHello\r\n ".trim(); // "Hello"

"".isEmpty(); // true，因为字符串长度为0
"  ".isEmpty(); // false，因为字符串长度不为0
"  \n".isBlank(); // true，因为只包含空白字符
" Hello ".isBlank(); // false，因为包含非空白字符

String s = "hello";
s.replace('l', 'w'); // "hewwo"，所有字符'l'被替换为'w'
s.replace("ll", "~~"); // "he~~o"，所有子串"ll"被替换为"~~"

replace还支持正则，没学过
    
    
String[] arr = {"A", "B", "C"};
String s = String.join("***", arr); // "A***B***C"


String.valueOf(123); // "123"
String.valueOf(45.67); // "45.67"
String.valueOf(true); // "true"
String.valueOf(new Object()); // 类似java.lang.Object@636be97c

char[] cs = "Hello".toCharArray(); // String -> char[]
String s = new String(cs); // char[] -> String
```

还要byte字符串编码啥的，这玩意我感觉需要就火速百度就完了。



### StringBuilder

String可以直接用+拼接，但是效率不高。

如果要一直添加字符的话可以用这个玩意

```java
StringBuilder sb = new StringBuilder(1024);
for (int i = 0; i < 1000; i++) {
    sb.append(',');
    sb.append(i);
}
String s = sb.toString();
```

支持链式操作，就是说可以一直`.append().append()...`之类的

还有个`insert`方法，要给插入的index和内容

不过链式操作只要函数结束之后返回对象引用就行了吧（

~~谁叫这玩意啥都是引用~~



### 包装类型

意思就是类似`int`这种基本类型用类进行了包装，可以使用引用和一些奇奇怪怪的方法。

进行一个抄

| 基本类型 | 对应的引用类型      |
| :------- | :------------------ |
| boolean  | java.lang.Boolean   |
| byte     | java.lang.Byte      |
| short    | java.lang.Short     |
| int      | java.lang.Integer   |
| long     | java.lang.Long      |
| float    | java.lang.Float     |
| double   | java.lang.Double    |
| char     | java.lang.Character |

int的转换示例

```java
int i = 100;
Integer n = Integer.valueOf(i);
int x = n.intValue();
你甚至可以这么写
Integer n = 100; // 编译器自动使用Integer.valueOf(int)
int x = n; // 编译器自动使用Integer.intValue()
```

很显然这个`Integer.valueOf(i)`是静态方法，而且这玩意实现有优化，比`new Integer(i)`效率更高，因为他返回给引用的可能是以前就已经存在的实例

当然，这些B东西都是不可更改的。。

静态方法`parseInt()`可以把字符串解析成一个整数



### 枚举类

例如我要定义周一到周日这7天，而且我不想让这7天以外的符号和他进行操作，就可以用`enum`关键字声明

```java
enum Weekday {
    SUN, MON, TUE, WED, THU, FRI, SAT;
}

本质来说感觉是这样，别问为啥例子变了，我也不知道
public final class Color extends Enum { // 继承自Enum，标记为final class
    // 每个实例均为全局唯一:
    public static final Color RED = new Color();
    public static final Color GREEN = new Color();
    public static final Color BLUE = new Color();
    // private构造方法，确保外部无法调用new操作符:
    private Color() {}
}
```

我个人感觉这些其实就是抽象符号，而且拥有`static final`的属性

这样就不会有类型外的值和非枚举类内的值相互比较了

因为有`static`的属性，我们显然可以用`==`进行比较

有方法`name()`返回常量名

```java
String s = Weekday.SUN.name(); // "SUN"
```

`ordinal()`返回定义的常量的顺序，从0开始计数

```java
int n = Weekday.MON.ordinal(); // 1
```

既然这玩意本质是类，我们也可以在里边改写构造方法，给它加上一些值

```java
enum Weekday {
    MON(1), TUE(2), WED(3), THU(4), FRI(5), SAT(6), SUN(0);
    
    public final int dayValue;
    
    private Weekday(int dayValue) {
        this.dayValue = dayValue;
    }
}
```

这样我们可以访问引用的`daValue`值获得信息。。



### 记录类

用来记录数据的不变类，写的更方便

```java
public record A(int x, int y){}
```

可以改写构造方法加上判断



### BigInteger

高精度，用它给你的方法就完了。

实例化的时候要用字符串

### BigDecimal

和上边那个差不多呃

> 通过`BigDecimal`的`stripTrailingZeros()`方法，可以将一个`BigDecimal`格式化为一个相等的，但去掉了末尾0的`BigDecimal`



### 工具类

- Math：数学计算
- Random：生成伪随机数
- SecureRandom：生成安全的随机数

呃这个感觉没啥好说的

#### Math

```java
Math.abs(-100); // 100
Math.abs(-7.8); // 7.8

Math.max(100, 99); // 100
Math.min(1.2, 2.3); // 1.2

Math.pow(2, 10); // 2的10次方=1024
Math.sqrt(2); // 1.414...
Math.exp(2); // 7.389...
Math.log(4); // 1.386...
Math.log10(100); // 2
Math.sin(3.14); // 0.00159...
Math.cos(3.14); // -0.9999...
Math.tan(3.14); // -0.0015...
Math.asin(1.0); // 1.57079...
Math.acos(1.0); // 0.0

double pi = Math.PI; // 3.14159...
double e = Math.E; // 2.7182818...
Math.sin(Math.PI / 6); // sin(π/6) = 0.5
0-1
Math.random(); // 0.53907... 每次都不一样
```

#### Random

```java
Random r = new Random(种子);
r.nextInt(); // 2071575453,每次都不一样
r.nextInt(10); // 5,生成一个[0,10)之间的int
r.nextLong(); // 8811649292570369305,每次都不一样
r.nextFloat(); // 0.54335...生成一个[0,1)之间的float
r.nextDouble(); // 0.3716...生成一个[0,1)之间的double
r.nextBytes();
```

#### SecureRandom

```java
SecureRandom sr = new SecureRandom();
```

然后疯狂的用就完了

----

DONE！！！！！
