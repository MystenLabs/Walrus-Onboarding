use walrus_sdk::client::quilt_client::QuiltClient;
use walrus_sdk::client::StoreArgs;
use walrus_sdk::types::QuiltStoreBlob;
use std::borrow::Cow;

async fn create_quilt(client: &walrus_sdk::client::WalrusNodeClient, file1_data: Vec<u8>, file2_data: Vec<u8>, encoding_type: walrus_core::EncodingType, epochs_ahead: u64) -> Result<(), anyhow::Error> {
    let quilt_client = client.quilt_client();

    // Prepare blobs with metadata
    let blobs = vec![
        QuiltStoreBlob {
            identifier: "file1".into(),
            tags: vec![
                ("author".into(), "Alice".into()),
                ("status".into(), "final".into()),
            ]
            .into_iter()
            .collect(),
            data: Cow::Owned(file1_data),
        },
        QuiltStoreBlob {
            identifier: "file2".into(),
            tags: Default::default(),
            data: Cow::Owned(file2_data),
        },
    ];

    // Construct the quilt
    let quilt = quilt_client
        .construct_quilt::<walrus_core::metadata::QuiltVersionV1>(&blobs, encoding_type)
        .await?;

    // Configure storage arguments
    let store_args = StoreArgs::new(
        encoding_type,
        epochs_ahead,
        Default::default(), // optimizations
        Default::default(), // persistence
        Default::default(), // post_store
    );

    // Store the quilt
    let result = quilt_client
        .reserve_and_store_quilt::<walrus_core::metadata::QuiltVersionV1>(&quilt, &store_args)
        .await?;

    let blob_id = result.blob_store_result.blob_id().expect("Quilt stored successfully");
    println!("Quilt stored with ID: {}", blob_id);
    
    Ok(())
}

