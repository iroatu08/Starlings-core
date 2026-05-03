import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailTemplateRenderer {
  private readonly cache = new Map<string, handlebars.TemplateDelegate>();

  private templatePath(templateRef: string): string {
    const name = templateRef.replace(/^\.\//, '').replace(/\.hbs$/, '');
    return join(__dirname, 'templates', `${name}.hbs`);
  }

  async render(templateRef: string, context: Record<string, unknown>): Promise<string> {
    const cacheKey = templateRef.replace(/^\.\//, '');
    let compiled = this.cache.get(cacheKey);
    if (!compiled) {
      const path = this.templatePath(templateRef);
      const src = await readFile(path, 'utf-8');
      compiled = handlebars.compile(src);
      this.cache.set(cacheKey, compiled);
    }
    return compiled(context);
  }
}
