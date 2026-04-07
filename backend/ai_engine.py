import os
import database as db
from openai import OpenAI

# ─────────────────────────────────────────────
#  OpenAI Configuration
# ─────────────────────────────────────────────
# Set your key in environment variable or replace here
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key-here")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY != "your-api-key-here" else None

def get_user_context_str(emp_no: str) -> str:
    """Build a context string about the current user for the AI."""
    emp = db.get_employee_by_empno(emp_no)
    if not emp:
        return "Current user is a guest (not logged in)."
    
    reports = db.get_all_reports(emp_no=emp_no)
    stats = db.get_stats()
    
    context = (
        f"معلومات المستخدم الحالي:\n"
        f"- الاسم: {emp['name_ar']}\n"
        f"- الرقم الوظيفي: {emp['emp_no']}\n"
        f"- الموقع الميداني: {emp.get('site', 'غير محدد')}\n"
        f"- القسم: {emp.get('department', '—')}\n"
        f"- عدد بلاغاته الشخصية: {len(reports)}\n"
        f"- إجمالي بلاغات النظام: {stats['total_reports']}\n"
    )
    return context

def process_command(text: str, session_emp_no: str = "guest") -> str:
    """
    Advanced AI Processor using ChatGPT.
    Injects real-time database context into the system prompt.
    """
    t = text.strip()
    user_context = get_user_context_str(session_emp_no)
    
    # System Prompt: Training the AI on its identity and environment
    system_prompt = (
        "أنت المساعد الذكي لنظام NIT الميداني. وظيفتك مساعدة الموظفين في الاستعلام عن البلاغات والإحصائيات.\n"
        "إليك معلومات عن النظام والمستخدم الحالي لتستخدمها في ردودك:\n"
        f"{user_context}\n\n"
        "تعليمات الرد:\n"
        "1. تحدث بلغة عربية مهنية وودودة (يمكنك استخدام لهجة سعودية بيضاء خفيفة إذا كان ذلك مناسباً).\n"
        "2. إذا سألك المستخدم عن بلاغاته، أعطه ملخصاً بناءً على الأرقام المذكورة في السياق.\n"
        "3. كن مختصراً ومفيداً.\n"
        "4. أنت خبير في إجراءات السلامة (HSE) ومراقبة المواقع الميدانية.\n"
    )

    if not client:
        return (
            "⚠️ تنبيه: مفتاح OpenAI غير مفعّل حالياً.\n"
            "سأرد عليك بشكل آلي: أهلاً بك! لقد استلمت رسالتك: '" + t + "'\n"
            "يرجى تزويد النظام بمفتاح API لتفعيل الردود الذكية."
        )

    try:
        response = client.chat.completions.create(
            model="gpt-4o", # Or gpt-3.5-turbo
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": t}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI] OpenAI Error: {e}")
        return "عذراً، واجهت مشكلة في الاتصال بمحرك الذكاء الاصطناعي. يرجى المحاولة لاحقاً."
