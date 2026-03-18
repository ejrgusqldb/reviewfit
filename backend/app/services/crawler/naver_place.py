"""
네이버 플레이스 리뷰 크롤러
- Playwright 기반 비동기 크롤링
- 네이버 플레이스 ID로 리뷰 목록 수집
"""
import asyncio
import re
from datetime import datetime, timezone

from playwright.async_api import async_playwright


NAVER_PLACE_URL = "https://map.naver.com/v5/entry/place/{place_id}"


async def crawl_naver_reviews(place_id: str, max_pages: int = 5) -> list[dict]:
    """
    네이버 플레이스의 리뷰를 크롤링합니다.

    Args:
        place_id: 네이버 플레이스 ID (URL에서 확인 가능)
        max_pages: 최대 크롤링 페이지 수

    Returns:
        리뷰 딕셔너리 목록
    """
    reviews = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        try:
            url = NAVER_PLACE_URL.format(place_id=place_id)
            await page.goto(url, wait_until="networkidle", timeout=30000)

            # 리뷰 탭 클릭
            review_tab = page.locator("a[href*='review']").first
            await review_tab.click()
            await page.wait_for_timeout(2000)

            for page_num in range(max_pages):
                # iframe 내부로 접근 (네이버 지도는 iframe 구조)
                frame = page.frame_locator("iframe#entryIframe").first

                review_items = await frame.locator(".pui__X35jYm").all()

                if not review_items:
                    break

                for item in review_items:
                    try:
                        review = await _parse_review_item(item)
                        if review:
                            reviews.append(review)
                    except Exception:
                        continue

                # 다음 페이지 버튼
                next_btn = frame.locator("a.pgbt").last
                is_disabled = await next_btn.get_attribute("aria-disabled")
                if is_disabled == "true":
                    break

                await next_btn.click()
                await page.wait_for_timeout(1500)

        except Exception as e:
            print(f"[Crawler] 크롤링 오류: {e}")
        finally:
            await browser.close()

    return reviews


async def _parse_review_item(item) -> dict | None:
    """리뷰 아이템 파싱"""
    try:
        # 리뷰 ID (네이버 내부 ID 추출)
        review_id_el = item.locator("[data-review-id]").first
        platform_review_id = await review_id_el.get_attribute("data-review-id")
        if not platform_review_id:
            # 고유 ID가 없으면 텍스트 해시로 대체
            text_el = item.locator(".pui__vn15t2").first
            text = await text_el.inner_text()
            platform_review_id = f"naver_{hash(text) & 0xFFFFFFFF}"

        # 작성자 이름
        reviewer_name = None
        try:
            name_el = item.locator(".pui__NMi-Dp").first
            reviewer_name = await name_el.inner_text()
        except Exception:
            pass

        # 별점 (aria-label에서 추출)
        rating = 5
        try:
            star_el = item.locator("[aria-label*='별점']").first
            label = await star_el.get_attribute("aria-label")
            match = re.search(r"(\d+)", label or "")
            if match:
                rating = int(match.group(1))
        except Exception:
            pass

        # 리뷰 내용
        content = None
        try:
            content_el = item.locator(".pui__vn15t2").first
            content = await content_el.inner_text()
        except Exception:
            pass

        # 작성일
        reviewed_at = None
        try:
            date_el = item.locator(".pui__3eU2mb").first
            date_text = await date_el.inner_text()
            reviewed_at = _parse_date(date_text)
        except Exception:
            pass

        return {
            "platform_review_id": f"naver_{platform_review_id}",
            "reviewer_name": reviewer_name,
            "rating": rating,
            "content": content,
            "reviewed_at": reviewed_at,
        }

    except Exception:
        return None


def _parse_date(date_text: str) -> datetime | None:
    """네이버 날짜 텍스트 파싱 (예: '2024.03.15', '3일 전', '방금')"""
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    date_text = date_text.strip()

    if "방금" in date_text:
        return now

    if "분 전" in date_text:
        match = re.search(r"(\d+)", date_text)
        if match:
            return now - timedelta(minutes=int(match.group(1)))

    if "시간 전" in date_text:
        match = re.search(r"(\d+)", date_text)
        if match:
            return now - timedelta(hours=int(match.group(1)))

    if "일 전" in date_text:
        match = re.search(r"(\d+)", date_text)
        if match:
            return now - timedelta(days=int(match.group(1)))

    # 2024.03.15 형식
    match = re.match(r"(\d{4})\.(\d{2})\.(\d{2})", date_text)
    if match:
        return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)), tzinfo=timezone.utc)

    return now
