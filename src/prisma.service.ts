import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  private readonly maxRetries = 5
  private readonly retryDelay = 2000 // ms

  async onModuleInit() {
    let attempts = 0
    while (attempts < this.maxRetries) {
      try {
        await this.$connect()
        this.logger.log("✅ Successfully connected to the database")
        return
      } catch (error) {
        attempts++
        this.logger.error(
          `❌ Failed to connect to the database (attempt ${attempts}/${this.maxRetries})`,
          (error as Error).message
        )
        if (attempts >= this.maxRetries) {
          this.logger.error("🚨 Max retries reached. Could not connect to the database.")
          throw error
        }
        await new Promise((res) => setTimeout(res, this.retryDelay))
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log("🔌 Disconnected from the database")
  }
}
