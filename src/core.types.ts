export interface UrlItem {
    id: string,
    url: string,
    emails: string,
    product_count: number,
    status: Status,
}

export type Status = 'not_started' | 'processing' | 'error' | 'partially_completed' | 'completed';