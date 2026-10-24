def test_list_all_courses(client):
    response = client.get("/api/v1/courses")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) == data["total"]
    assert "sample_notice" in data


def test_filter_courses_by_audience(client):
    response = client.get("/api/v1/courses?audience=freshers")
    assert response.status_code == 200
    data = response.json()
    for course in data["items"]:
        assert course["audience"] in ["freshers", "all"]


def test_search_courses(client):
    response = client.get("/api/v1/courses?search=Kubernetes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Kubernetes" in item["key_skills"] or "Kubernetes" in item["tagline"] for item in data["items"])


def test_get_valid_course_detail(client):
    slug = "fullstack-web-engineering"
    response = client.get(f"/api/v1/courses/{slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == slug
    assert "modules" in data
    assert len(data["modules"]) > 0
    assert "projects" in data
    assert len(data["projects"]) > 0
    assert "prerequisites" in data


def test_get_nonexistent_course_detail(client):
    response = client.get("/api/v1/courses/non-existent-course-slug")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
