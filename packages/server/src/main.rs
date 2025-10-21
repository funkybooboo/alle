#[tokio::main]
async fn main() {
    println!("Hello from Tokio!");
}

#[cfg(test)]
mod tests {
    // Import the outer functions and items
    use super::*;

    // A simple async test using Tokio runtime
    #[tokio::test]
    async fn simple_async_test() {
        let result = async { 2 + 2 }.await;
        assert_eq!(result, 4);
    }
}
