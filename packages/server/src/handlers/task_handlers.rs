use crate::AppContext;
use hyper::{Body, Method, Request, Response, StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateTaskRequest {
    #[schema(example = "New task to complete")]
    pub title: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateTaskRequest {
    #[schema(example = "Updated task title")]
    pub title: Option<String>,
    #[schema(example = true)]
    pub completed: Option<bool>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct TaskResponse {
    #[schema(example = 1)]
    pub id: i32,
    #[schema(example = "Complete project documentation")]
    pub title: String,
    #[schema(example = false)]
    pub completed: bool,
    #[schema(example = "2025-10-24 00:00:00.000000000 UTC")]
    pub created_at: String,
    #[schema(example = "2025-10-24 00:00:00.000000000 UTC")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorResponse {
    #[schema(example = "Task not found")]
    pub error: String,
}

impl From<crate::entities::task::Model> for TaskResponse {
    fn from(task: crate::entities::task::Model) -> Self {
        Self {
            id: task.id,
            title: task.title,
            completed: task.completed,
            created_at: task.created_at.to_string(),
            updated_at: task.updated_at.to_string(),
        }
    }
}

pub async fn handle_tasks(
    req: Request<Body>,
    ctx: Arc<AppContext>,
) -> Result<Response<Body>, hyper::Error> {
    let method = req.method().clone();
    let path = req.uri().path().to_string();

    match (method, path.as_str()) {
        (Method::GET, "/api/tasks") => get_all_tasks(ctx).await,
        (Method::GET, "/api/tasks/incomplete") => get_incomplete_tasks(ctx).await,
        (Method::GET, path) if path.starts_with("/api/tasks/") => {
            let id = path.trim_start_matches("/api/tasks/");
            get_task_by_id(ctx, id).await
        }
        (Method::POST, "/api/tasks") => create_task(req, ctx).await,
        (Method::PUT, path) if path.starts_with("/api/tasks/") => {
            let id = path.trim_start_matches("/api/tasks/").to_string();
            update_task(req, ctx, &id).await
        }
        (Method::DELETE, path) if path.starts_with("/api/tasks/") => {
            let id = path.trim_start_matches("/api/tasks/");
            delete_task(ctx, id).await
        }
        _ => {
            let response = Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("Not Found"))
                .unwrap();
            Ok(response)
        }
    }
}

async fn get_all_tasks(ctx: Arc<AppContext>) -> Result<Response<Body>, hyper::Error> {
    match ctx.task_repository.find_all().await {
        Ok(tasks) => {
            let response: Vec<TaskResponse> = tasks.into_iter().map(TaskResponse::from).collect();
            let json = serde_json::to_string(&response).unwrap();
            let response = Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}

async fn get_task_by_id(
    ctx: Arc<AppContext>,
    id_str: &str,
) -> Result<Response<Body>, hyper::Error> {
    let id: i32 = match id_str.parse() {
        Ok(id) => id,
        Err(_) => {
            let error = ErrorResponse {
                error: "Invalid ID".to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            return Ok(response);
        }
    };

    match ctx.task_repository.find_by_id(id).await {
        Ok(Some(task)) => {
            let response = TaskResponse::from(task);
            let json = serde_json::to_string(&response).unwrap();
            let response = Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Ok(None) => {
            let error = ErrorResponse {
                error: "Task not found".to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::NOT_FOUND)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}

async fn create_task(
    req: Request<Body>,
    ctx: Arc<AppContext>,
) -> Result<Response<Body>, hyper::Error> {
    let body_bytes = hyper::body::to_bytes(req.into_body()).await?;

    let create_req: CreateTaskRequest = match serde_json::from_slice(&body_bytes) {
        Ok(req) => req,
        Err(e) => {
            let error = ErrorResponse {
                error: format!("Invalid JSON: {}", e),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            return Ok(response);
        }
    };

    match ctx.task_repository.create(create_req.title).await {
        Ok(task) => {
            let response = TaskResponse::from(task);
            let json = serde_json::to_string(&response).unwrap();
            let response = Response::builder()
                .status(StatusCode::CREATED)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}

async fn update_task(
    req: Request<Body>,
    ctx: Arc<AppContext>,
    id_str: &str,
) -> Result<Response<Body>, hyper::Error> {
    let id: i32 = match id_str.parse() {
        Ok(id) => id,
        Err(_) => {
            let error = ErrorResponse {
                error: "Invalid ID".to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            return Ok(response);
        }
    };

    let body_bytes = hyper::body::to_bytes(req.into_body()).await?;

    let update_req: UpdateTaskRequest = match serde_json::from_slice(&body_bytes) {
        Ok(req) => req,
        Err(e) => {
            let error = ErrorResponse {
                error: format!("Invalid JSON: {}", e),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            return Ok(response);
        }
    };

    match ctx
        .task_repository
        .update(id, update_req.title, update_req.completed)
        .await
    {
        Ok(task) => {
            let response = TaskResponse::from(task);
            let json = serde_json::to_string(&response).unwrap();
            let response = Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}

async fn delete_task(ctx: Arc<AppContext>, id_str: &str) -> Result<Response<Body>, hyper::Error> {
    let id: i32 = match id_str.parse() {
        Ok(id) => id,
        Err(_) => {
            let error = ErrorResponse {
                error: "Invalid ID".to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            return Ok(response);
        }
    };

    match ctx.task_repository.delete(id).await {
        Ok(rows_affected) => {
            if rows_affected > 0 {
                let response = Response::builder()
                    .status(StatusCode::NO_CONTENT)
                    .body(Body::empty())
                    .unwrap();
                Ok(response)
            } else {
                let error = ErrorResponse {
                    error: "Task not found".to_string(),
                };
                let json = serde_json::to_string(&error).unwrap();
                let response = Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .header("Content-Type", "application/json")
                    .body(Body::from(json))
                    .unwrap();
                Ok(response)
            }
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}

async fn get_incomplete_tasks(ctx: Arc<AppContext>) -> Result<Response<Body>, hyper::Error> {
    match ctx.task_repository.find_incomplete().await {
        Ok(tasks) => {
            let response: Vec<TaskResponse> = tasks.into_iter().map(TaskResponse::from).collect();
            let json = serde_json::to_string(&response).unwrap();
            let response = Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
        Err(e) => {
            let error = ErrorResponse {
                error: e.to_string(),
            };
            let json = serde_json::to_string(&error).unwrap();
            let response = Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(Body::from(json))
                .unwrap();
            Ok(response)
        }
    }
}
