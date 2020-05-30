clean:
	@rm -rf ./build

release:
	@rm -rf ./build/release
	@ht --release

stage: release
	@aws s3 sync --profile=tmpfs build/release s3://tmpfs.org/stage

production: release
	@aws s3 sync --profile=tmpfs build/release s3://tmpfs.org/production

.PHONY: clean release stage production
