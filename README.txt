نشر الداشبورد على الإنترنت (Render) - 3 خطوات
==============================================
1) ارفع الملفات على GitHub
   - github.com > سجّل دخول > New repository > الاسم: kama-dashboard > اختر Private > Create
   - اضغط "uploading an existing file" واسحب كل محتويات هذا المجلد:
       server.js  package.json  render.yaml  وفولدر public (فيه index.html)
   - اضغط Commit changes

2) انشر على Render
   - render.com > سجّل بحساب GitHub
   - New + > Blueprint > اختر مستودع kama-dashboard > Connect
   - اكتب كلمة السر في خانة PASSWORD (دي اللي هتدخلها للناس)
   - اضغط Apply (هيطلب بطاقة دفع - الخطة Starter تقريبًا 7$ شهريًا + قرص 1GB)

3) شارك الرابط
   - بعد 2-3 دقائق هيظهر رابط زي https://kama-dashboard.onrender.com
   - ابعت الرابط + كلمة السر. أي اسم مستخدم يشتغل، المهم كلمة السر.

لتحديث الداشبورد لاحقًا: على GitHub افتح public/index.html > Edit > الصق/ارفع النسخة الجديدة > Commit.
التصنيفات المحفوظة مش بتتمسح عند التحديث.
