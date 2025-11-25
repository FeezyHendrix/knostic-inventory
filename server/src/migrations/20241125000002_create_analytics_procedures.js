/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Advanced Sales Analytics Stored Procedure
  await knex.raw(`
    CREATE OR REPLACE FUNCTION get_product_sales_analytics(
        p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_store_id INTEGER DEFAULT NULL,
        p_group_by VARCHAR DEFAULT 'day'
    )
    RETURNS TABLE (
        time_period TIMESTAMP WITH TIME ZONE,
        period_label TEXT,
        total_quantity BIGINT,
        total_revenue NUMERIC,
        unique_products BIGINT,
        average_order_value NUMERIC,
        store_count BIGINT
    ) AS $$
    BEGIN
        -- Set default date range if not provided (last 30 days)
        IF p_start_date IS NULL THEN
            p_start_date := NOW() - INTERVAL '30 days';
        END IF;
        
        IF p_end_date IS NULL THEN
            p_end_date := NOW();
        END IF;

        -- Validate groupBy parameter
        IF p_group_by NOT IN ('hour', 'day', 'week', 'month') THEN
            RAISE EXCEPTION 'Invalid group_by parameter. Must be: hour, day, week, month';
        END IF;

        -- Return query with proper NULL handling
        IF p_store_id IS NULL THEN
            RETURN QUERY
            EXECUTE format('
                SELECT 
                    date_trunc(%L, ps.sale_date) as time_period,
                    to_char(date_trunc(%L, ps.sale_date), 
                        CASE %L
                            WHEN ''hour'' THEN ''YYYY-MM-DD HH24:MI''
                            WHEN ''day'' THEN ''YYYY-MM-DD''
                            WHEN ''week'' THEN ''YYYY-"W"WW''
                            WHEN ''month'' THEN ''YYYY-MM''
                        END
                    ) as period_label,
                    SUM(ps.quantity_sold)::BIGINT as total_quantity,
                    SUM(ps.total_amount)::NUMERIC(12,2) as total_revenue,
                    COUNT(DISTINCT ps.product_id)::BIGINT as unique_products,
                    CASE 
                        WHEN SUM(ps.quantity_sold) > 0 
                        THEN (SUM(ps.total_amount) / SUM(ps.quantity_sold))::NUMERIC(12,2)
                        ELSE 0::NUMERIC(12,2)
                    END as average_order_value,
                    COUNT(DISTINCT ps.store_id)::BIGINT as store_count
                FROM product_sales ps
                WHERE ps.sale_date >= %L
                  AND ps.sale_date <= %L
                GROUP BY date_trunc(%L, ps.sale_date)
                ORDER BY time_period ASC
            ', p_group_by, p_group_by, p_group_by, p_start_date, p_end_date, p_group_by);
        ELSE
            RETURN QUERY
            EXECUTE format('
                SELECT 
                    date_trunc(%L, ps.sale_date) as time_period,
                    to_char(date_trunc(%L, ps.sale_date), 
                        CASE %L
                            WHEN ''hour'' THEN ''YYYY-MM-DD HH24:MI''
                            WHEN ''day'' THEN ''YYYY-MM-DD''
                            WHEN ''week'' THEN ''YYYY-"W"WW''
                            WHEN ''month'' THEN ''YYYY-MM''
                        END
                    ) as period_label,
                    SUM(ps.quantity_sold)::BIGINT as total_quantity,
                    SUM(ps.total_amount)::NUMERIC(12,2) as total_revenue,
                    COUNT(DISTINCT ps.product_id)::BIGINT as unique_products,
                    CASE 
                        WHEN SUM(ps.quantity_sold) > 0 
                        THEN (SUM(ps.total_amount) / SUM(ps.quantity_sold))::NUMERIC(12,2)
                        ELSE 0::NUMERIC(12,2)
                    END as average_order_value,
                    COUNT(DISTINCT ps.store_id)::BIGINT as store_count
                FROM product_sales ps
                WHERE ps.sale_date >= %L
                  AND ps.sale_date <= %L
                  AND ps.store_id = %L
                GROUP BY date_trunc(%L, ps.sale_date)
                ORDER BY time_period ASC
            ', p_group_by, p_group_by, p_group_by, p_start_date, p_end_date, p_store_id, p_group_by);
        END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Store Performance Rankings Stored Procedure  
  await knex.raw(`
    CREATE OR REPLACE FUNCTION get_store_performance_rankings(
        p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_limit INTEGER DEFAULT 10
    )
    RETURNS TABLE (
        store_id INTEGER,
        store_name TEXT,
        store_city TEXT,
        store_state TEXT,
        total_products BIGINT,
        active_products BIGINT,
        total_inventory_value NUMERIC,
        total_sales_revenue NUMERIC,
        total_units_sold BIGINT,
        average_product_price NUMERIC,
        inventory_turnover_ratio NUMERIC,
        performance_score NUMERIC,
        performance_rank INTEGER
    ) AS $$
    BEGIN
        -- Set default date range if not provided (last 30 days)
        IF p_start_date IS NULL THEN
            p_start_date := NOW() - INTERVAL '30 days';
        END IF;
        
        IF p_end_date IS NULL THEN
            p_end_date := NOW();
        END IF;

        -- Validate limit parameter
        IF p_limit <= 0 OR p_limit > 100 THEN
            RAISE EXCEPTION 'Limit must be between 1 and 100';
        END IF;

        RETURN QUERY
        WITH store_metrics AS (
            SELECT 
                s.id,
                s.name,
                s.city,
                s.state,
                COUNT(DISTINCT p.id)::BIGINT as product_count,
                COUNT(DISTINCT CASE WHEN p.quantity_in_stock > 0 THEN p.id END)::BIGINT as active_product_count,
                COALESCE(SUM(p.price * p.quantity_in_stock), 0)::NUMERIC(15,2) as inventory_value,
                COALESCE(SUM(sales.total_amount), 0)::NUMERIC(15,2) as sales_revenue,
                COALESCE(SUM(sales.quantity_sold), 0)::BIGINT as units_sold,
                CASE 
                    WHEN COUNT(p.id) > 0 
                    THEN (SUM(p.price) / COUNT(p.id))::NUMERIC(10,2)
                    ELSE 0::NUMERIC(10,2)
                END as avg_price
            FROM stores s
            LEFT JOIN products p ON s.id = p.store_id
            LEFT JOIN (
                SELECT 
                    ps.store_id,
                    ps.product_id,
                    SUM(ps.total_amount) as total_amount,
                    SUM(ps.quantity_sold) as quantity_sold
                FROM product_sales ps
                WHERE ps.sale_date >= p_start_date 
                  AND ps.sale_date <= p_end_date
                GROUP BY ps.store_id, ps.product_id
            ) sales ON s.id = sales.store_id
            GROUP BY s.id, s.name, s.city, s.state
        ),
        ranked_stores AS (
            SELECT 
                sm.*,
                CASE 
                    WHEN sm.inventory_value > 0 AND sm.sales_revenue > 0
                    THEN (sm.sales_revenue / sm.inventory_value)::NUMERIC(10,4)
                    ELSE 0::NUMERIC(10,4)
                END as turnover_ratio,
                -- Weighted performance score calculation
                (
                    (sm.sales_revenue * 0.4) +                    -- 40% weight on revenue
                    (sm.units_sold * sm.avg_price * 0.3) +        -- 30% weight on volume × price
                    (sm.active_product_count * 100 * 0.2) +       -- 20% weight on product diversity
                    (CASE WHEN sm.inventory_value > 0 
                      THEN (sm.sales_revenue / sm.inventory_value * 1000)
                      ELSE 0 END * 0.1)                           -- 10% weight on turnover efficiency
                )::NUMERIC(15,2) as perf_score
            FROM store_metrics sm
        )
        SELECT 
            rs.id::INTEGER,
            rs.name::TEXT,
            rs.city::TEXT,
            rs.state::TEXT,
            rs.product_count,
            rs.active_product_count,
            rs.inventory_value,
            rs.sales_revenue,
            rs.units_sold,
            rs.avg_price,
            rs.turnover_ratio,
            rs.perf_score,
            ROW_NUMBER() OVER (ORDER BY rs.perf_score DESC)::INTEGER as rank
        FROM ranked_stores rs
        ORDER BY rs.perf_score DESC
        LIMIT p_limit;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Top Products by Store Analytics
  await knex.raw(`
    CREATE OR REPLACE FUNCTION get_top_products_by_store(
        p_store_id INTEGER,
        p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        p_limit INTEGER DEFAULT 10
    )
    RETURNS TABLE (
        product_id INTEGER,
        product_name TEXT,
        product_category TEXT,
        product_sku TEXT,
        current_stock INTEGER,
        current_price NUMERIC,
        total_units_sold BIGINT,
        total_revenue NUMERIC,
        average_sale_price NUMERIC,
        sales_frequency NUMERIC,
        revenue_per_day NUMERIC,
        stock_turnover_rate NUMERIC,
        product_rank INTEGER
    ) AS $$
    BEGIN
        -- Validate store_id
        IF p_store_id IS NULL THEN
            RAISE EXCEPTION 'Store ID cannot be null';
        END IF;

        -- Set default date range if not provided (last 30 days)
        IF p_start_date IS NULL THEN
            p_start_date := NOW() - INTERVAL '30 days';
        END IF;
        
        IF p_end_date IS NULL THEN
            p_end_date := NOW();
        END IF;

        -- Validate limit parameter
        IF p_limit <= 0 OR p_limit > 100 THEN
            RAISE EXCEPTION 'Limit must be between 1 and 100';
        END IF;

        RETURN QUERY
        WITH product_analytics AS (
            SELECT 
                p.id,
                p.name,
                p.category,
                p.sku,
                p.quantity_in_stock,
                p.price,
                COALESCE(SUM(ps.quantity_sold), 0)::BIGINT as units_sold,
                COALESCE(SUM(ps.total_amount), 0)::NUMERIC(12,2) as revenue,
                CASE 
                    WHEN SUM(ps.quantity_sold) > 0 
                    THEN (SUM(ps.total_amount) / SUM(ps.quantity_sold))::NUMERIC(10,2)
                    ELSE 0::NUMERIC(10,2)
                END as avg_sale_price,
                COUNT(ps.id)::NUMERIC as sale_frequency,
                CASE 
                    WHEN EXTRACT(EPOCH FROM (p_end_date - p_start_date)) > 0
                    THEN (COALESCE(SUM(ps.total_amount), 0) / (EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 86400))::NUMERIC(10,2)
                    ELSE 0::NUMERIC(10,2)
                END as daily_revenue,
                CASE 
                    WHEN p.quantity_in_stock > 0 AND COALESCE(SUM(ps.quantity_sold), 0) > 0
                    THEN (COALESCE(SUM(ps.quantity_sold), 0)::NUMERIC / p.quantity_in_stock::NUMERIC)::NUMERIC(10,4)
                    ELSE 0::NUMERIC(10,4)
                END as turnover_rate
            FROM products p
            LEFT JOIN product_sales ps ON p.id = ps.product_id 
                AND ps.sale_date >= p_start_date 
                AND ps.sale_date <= p_end_date
            WHERE p.store_id = p_store_id
            GROUP BY p.id, p.name, p.category, p.sku, p.quantity_in_stock, p.price
        )
        SELECT 
            pa.id::INTEGER,
            pa.name::TEXT,
            pa.category::TEXT,
            pa.sku::TEXT,
            pa.quantity_in_stock::INTEGER,
            pa.price,
            pa.units_sold,
            pa.revenue,
            pa.avg_sale_price,
            pa.sale_frequency,
            pa.daily_revenue,
            pa.turnover_rate,
            ROW_NUMBER() OVER (
                ORDER BY 
                    pa.revenue DESC,
                    pa.units_sold DESC,
                    pa.sale_frequency DESC
            )::INTEGER as rank
        FROM product_analytics pa
        ORDER BY 
            pa.revenue DESC,
            pa.units_sold DESC,
            pa.sale_frequency DESC
        LIMIT p_limit;
    END;
    $$ LANGUAGE plpgsql;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP FUNCTION IF EXISTS get_product_sales_analytics(timestamp with time zone, timestamp with time zone, integer, character varying)');
  await knex.raw('DROP FUNCTION IF EXISTS get_store_performance_rankings(timestamp with time zone, timestamp with time zone, integer)');
  await knex.raw('DROP FUNCTION IF EXISTS get_top_products_by_store(integer, timestamp with time zone, timestamp with time zone, integer)');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};