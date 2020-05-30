release:
	@ht --release

stage: release
	@aws s3 sync --profile=tmpfs build/release s3://tmpfs.org/stage

production: release
	@aws s3 sync --profile=tmpfs build/release s3://tmpfs.org/production

.PHONY: stage
